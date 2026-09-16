import { useState } from "react";
import { useImageMutation } from "./useCommonMutation";
import localforage from "localforage";
import { useOfflineImageKeys } from './useOfflineImageKeys';
import { useQueryClient } from "@tanstack/react-query";

export const useOfflineImageUpload = (projectId) => {
    const queryClient = useQueryClient() 
    const {offlineProjectImages} = useOfflineImageKeys(projectId)

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
        setTotalOfflineImages(offlineProjectImages.length);
        setUploadedOfflineImages(0);
        setIsUploadingCompleted(false)

    }

    const uploadAllImages = async () => {
        setIsUploading(true);
        resetCount()
        for (const [idx, key] of offlineProjectImages.entries()) {
            setCurrentlyUploadingImageIndex(idx + 1);

            try {
                //fetch file form IndexDB
                const file = await localforage.getItem(key);
                if (!file) {
                    console.error(`File not found for key: ${key}`);
                    continue;
                }

                //upload to server
                await uploadImage.mutateAsync({
                    file: file.file,
                    equipmentId: file.equipmentId,
                    data: file.data
                });

                await localforage.removeItem(key);

                //remove key from query data records
                queryClient.setQueryData(
                    ["offlineImageKeys", projectId],
                    offlineImageKeys  =>  offlineImageKeys.filter(offlineKey => offlineKey != key)
                )
                
                
                setUploadedOfflineImages(prev => prev + 1);
            } catch (error) {
                console.error('Upload failed for image:', error);
                setFailedUploads(prev=>prev+1)
                // Decide whether to 'continue' to the next image or 'break' the loop on error
            }
        }

        setIsUploading(false);
        setIsUploadingCompleted(true);
    };

    return {
        uploadAllImages,
        offlineProjectImages,
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