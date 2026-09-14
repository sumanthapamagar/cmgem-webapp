import { useContext, useState } from "react";
import { useImageMutation } from "./useCommonMutation";
import localforage from "localforage";
import { useQueryClient } from "@tanstack/react-query";
import { ProjectContext } from "../features/projects/projectContext";

export const useOfflineImageUpload = (projectId) => {
    const {setTotalOfflineImages, setUploadedOfflineImages, setIsUploading, setIsUploadingCompleted} = useContext(ProjectContext);
    const queryClient = useQueryClient();

    const [currentlyUploadingImageIndex, setCurrentlyUploadingImageIndex] = useState(-1);

    const uploadImage = useImageMutation({
        projectId,
        equipmentId: null 
    });

    const uploadAllImages = async (imagesKeys) => {
        setTotalOfflineImages(imagesKeys.length);
        setIsUploading(true);
        if(!imagesKeys || imagesKeys.length === 0) {
            console.warn("No images to upload.");
            return;
        }
        const uploadPromises = imagesKeys.map(async (key, idx) => {
            setCurrentlyUploadingImageIndex(idx+1);

            localforage.getItem(key).then(async (file) => {
                if (!file) {
                    console.error(`File not found for key: ${key}`);
                    return;
                }
                setIsUploading(true);

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
            }).catch((error) => {
                console.error('Upload failed for image:', error);
            }) 
        });

        await Promise.all(uploadPromises).finally(() => {
            setIsUploadingCompleted(true)   ;
            setIsUploading(false);
        })
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