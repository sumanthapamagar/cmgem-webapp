import localforage from 'localforage';
import { useQueryClient } from '@tanstack/react-query';

export const useImageUpload = (projectId, equipmentId, inspectionItem) => {
    const queryClient = useQueryClient();

    const onSelectImages = async (ev) => {
        const selectedFiles = ev.target?.files;

        const uploadPromises = Array.from(selectedFiles)
            .map(async (file, idx) => {
                const img_key = `photo_${projectId}_${equipmentId}_${inspectionItem._id}_${Date.now()}_${idx}`;
                
                await localforage.setItem(img_key, {
                    id: img_key,
                    file: file, 
                    equipmentId: equipmentId,
                    data: {
                        group_id: inspectionItem.location,
                        equipmentId: equipmentId,
                        inspection_item: inspectionItem._id
                    }
                });

                // // Mark as uploading
                // setImages(prev => prev.map((img, i) => 
                //     i === idx ? { ...img, isUploading: true, isUploadError: false } : img
                // ));

                // try {
                //     await uploadImage.mutateAsync({
                //         file: file.file,
                //         equipmentId: inspectionItem.equipmentId,
                //         data: {
                //             group_id: inspectionItem.location,
                //             equipmentId: inspectionItem.equipmentId,
                //             inspection_item: inspectionItem._id
                //         }
                //     });
                    
                //     // Mark as uploaded
                //     setImages(prev => prev.map((img, i) => 
                //         i === idx ? { ...img, isUploading: false, isUploaded: true } : img
                //     ));
                // } catch (error) {
                //     // Mark as error
                //     setImages(prev => prev.map((img, i) => 
                //         i === idx ? { ...img, isUploading: false, isUploadError: true } : img
                //     ));
                //     console.error('Upload failed for image:', error);
                // }
            });

        await Promise.all(uploadPromises);
        queryClient.invalidateQueries({
            queryKey: ["offlineImageKeys", projectId],
        });
    };


    return { 
        onSelectImages 
    };
};
