import { useState } from "react";
import { useImageMutation } from "./useCommonMutation";
import localforage from "localforage";
import { useQueryClient } from "@tanstack/react-query";
import { useOfflineImageKeys } from './useOfflineImageKeys';

export const useOfflineImageUpload = (projectId) => {
    const queryClient = useQueryClient();
    const {offlineImageKeys} = useOfflineImageKeys(projectId);

    const [currentlyUploadingImageIndex, setCurrentlyUploadingImageIndex] = useState(-1);
    const [failedUploads, setFailedUploads] = useState(0)
    const [totalOfflineImages, setTotalOfflineImages] = useState(0);    
    const [uploadedOfflineImages, setUploadedOfflineImages] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingCompleted, setIsUploadingCompleted] = useState(false);

    const uploadImage = useImageMutation({
        projectId,
        equipmentId: null 
    });

    const resetCount=()=>{
        setCurrentlyUploadingImageIndex(-1)
        setFailedUploads(0)
        setTotalOfflineImages(offlineImageKeys.length);
        setUploadedOfflineImages(0);
        setIsUploadingCompleted(false)

    }

    const uploadAllImages = async () => {
        setIsUploading(true);
        resetCount()
        for (const [idx, key] of offlineImageKeys.entries()) {
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
                setFailedUploads(prev=>prev+1)
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
        offlineImageKeys,
        currentlyUploadingImageIndex,
        failedUploads,
        totalOfflineImages,
        uploadedOfflineImages,
        isUploading,
        isUploadingCompleted,
        setIsUploading,
        setIsUploadingCompleted,
        setUploadedOfflineImages,
        resetCount
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