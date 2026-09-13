import { useContext, useState } from "react";
import { useImageMutation } from "./useCommonMutation";
import localforage from "localforage";
import { useQueryClient } from "@tanstack/react-query";
import { ProjectContext } from "../features/projects/projectContext";

export const useOfflineImageUpload = (projectId) => {
    const {setTotalOfflineImages, setUploadedOfflineImages} = useContext(ProjectContext);
    const [isUploading, setIsUploading] = useState(false);
    const queryClient = useQueryClient();

    const [currentlyUploadingImageIndex, setCurrentlyUploadingImageIndex] = useState(-1);

    const uploadImage = useImageMutation({
        projectId,
        equipmentId: null 
    });

    const uploadAllImages = async (imagesKeys) => {
        setTotalOfflineImages(imagesKeys.length);
        if(!imagesKeys || imagesKeys.length === 0) {
            console.warn("No images to upload.");
            return;
        }
        setIsUploading(true);
        const uploadPromises = imagesKeys.map(async (key, idx) => {
            setCurrentlyUploadingImageIndex(idx+1);

            localforage.getItem(key).then(async (file) => {
                if (!file) {
                    console.error(`File not found for key: ${key}`);
                    return;
                }
                await uploadImage.mutateAsync({
                    file: getBlob(file.file),
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

        await Promise.all(uploadPromises);
        
                    queryClient.invalidateQueries({
                        queryKey: ["offlineImageKeys", projectId],
                    });
        setIsUploading(false);
    };

    return {
        uploadAllImages,
        isUploading,
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