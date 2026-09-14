import { useContext, useState } from "react";
import { useImageMutation } from "./useCommonMutation";
import localforage from "localforage";
import { useQueryClient } from "@tanstack/react-query";
import { ProjectContext } from "../features/projects/projectContext";

export const useOfflineImageUpload = (projectId) => {
    const {setTotalOfflineImages, setUploadedOfflineImages, setIsUploading, setIsUploadingCompleted, setFailedUploads} = useContext(ProjectContext);
    const queryClient = useQueryClient();

    const [currentlyUploadingImageIndex, setCurrentlyUploadingImageIndex] = useState(-1);

    const uploadImage = useImageMutation({
        projectId,
        equipmentId: null 
    });

    const uploadAllImages = async (imagesKeys) => {
        setFailedUploads(0)
        setTotalOfflineImages(imagesKeys.length);
        setIsUploading(true);

        for (const [idx, key] of imagesKeys.entries()) {
            setCurrentlyUploadingImageIndex(idx + 1);

            try {
                const file = await localforage.getItem(key);
                if (!file) {
                    console.error(`File not found for key: ${key}`);
                    continue;
                }

                await uploadImage.mutateAsync({
                    file: file.file,
                    equipmentId: file.equipmentId,
                    data: file.data
                });

                await localforage.removeItem(key);
                
                queryClient.invalidateQueries({
                    queryKey: ["offlineImageKeys", projectId],
                });

                setUploadedOfflineImages(prev => prev + 1);
            } catch (error) {
                console.error('Upload failed for image:', error);
                // Decide whether to 'continue' to the next image or 'break' the loop on error
            }
        }

        setIsUploading(false);
        setIsUploadingCompleted(true);
        queryClient.invalidateQueries({
            queryKey: ["offlineImageKeys", projectId],
        });
    };

    return {
        uploadAllImages,
        currentlyUploadingImageIndex
    }
}


function getBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}