import { Stack, Text } from "../../../../../../../components";
import { ImageThumbnail } from "./ImageThumbnail";
import { useEffect, useState } from "react";
import localforage from "localforage";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useOfflineImageKeys } from "../../../../../../../hooks/useOfflineImageKeys";

export const OfflineImageGallary = ({
    inspectionItem
}) => {
    const { projectId, equipmentId } = useParams();
    const [images, setImages] = useState([]);
    const { offlineProjectImages } = useOfflineImageKeys(projectId)

    useEffect(() => {
        let isMounted = true;

        const loadOfflineImages = async () => {
            // 1. Guard against missing ID or empty image sets
            if (!inspectionItem?._id || !offlineProjectImages?.length) {
                setImages([]);
                return;
            }

            // 2. Filter keys relevant to this specific inspection item
            const prefix = `photo_${projectId}_${equipmentId}_${inspectionItem._id}_`;
            const relevantKeys = offlineProjectImages.filter(key => key.includes(prefix));

            if (relevantKeys.length === 0) {
                setImages([]);
                return;
            }

            try {
                // 3. Concurrently fetch all matches from localforage
                const imagePromises = relevantKeys.map(key => localforage.getItem(key));
                const resolvedImages = await Promise.all(imagePromises);

                if (isMounted) {
                    setImages(resolvedImages.filter(Boolean));
                }
            } catch (error) {
                console.error("Failed to load offline images", error);
            }
        };

        loadOfflineImages();

        // 4. Genuine useEffect cleanup to prevent race conditions on unmount
        return () => {
            isMounted = false;
        };
    }, [offlineProjectImages]);

    if(!images || images.length === 0) {
        return null;
    }

    return (
        <Stack className=" border border-gray-200 p-2 rounded bg-gray-200">
            <Text className="text-gray-700 text-sm font-semibold">Offline Images - Pending Upload</Text>
            <Stack horizontal className="gap-4">
                {images?.map((image) => (
                    <ImageThumbnail 
                        key={image.id}
                        isOnlineImage={false}
                        image={image}
                    />
                ))}
            </Stack>
        </Stack>
    );
};
