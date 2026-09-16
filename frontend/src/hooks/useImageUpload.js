import localforage from 'localforage';
import { useQueryClient } from '@tanstack/react-query';

export const useImageUpload = (projectId, equipmentId, inspectionItem) => {
    const queryClient = useQueryClient();
    const offlineQuerykey = ["offlineImageKeys", projectId]

    const onSelectImages = async (ev) => {

        const selectedFiles = ev.target?.files;
        const new_keys = []

        const uploadPromises = Array.from(selectedFiles)
            .map(async (file, idx) => {
                const img_key = `photo_${projectId}_${equipmentId}_${inspectionItem._id}_${Date.now()}_${idx}`;
                new_keys.push(img_key)
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
            });

        await Promise.all(uploadPromises);

        queryClient.setQueryData(offlineQuerykey,
            keys=> [
                ...(keys ?? []),
                ...new_keys
            ]
        )
    };


    return { 
        onSelectImages 
    };
};
