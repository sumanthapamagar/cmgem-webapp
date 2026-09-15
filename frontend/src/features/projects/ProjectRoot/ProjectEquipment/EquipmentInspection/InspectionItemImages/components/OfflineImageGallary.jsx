import { useParams } from "react-router-dom";
import { Stack, LoadingState, Text } from "../../../../../../../components";
import { ImageThumbnail } from "./ImageThumbnail";
import { ProjectContext } from "../../../../../projectContext";
import { useContext, useEffect, useState } from "react";
import localforage from "localforage";
import { useQueryClient } from "@tanstack/react-query";

export const OfflineImageGallary = ({
    imageKeys,
    updateImageKeys,
    onImageClick
}) => {
    const queryClient = useQueryClient();

    const { offlineProject: project } = useContext(ProjectContext);

    const [images, setImages] = useState([]);

    const getOfflineImages = async () => {
        setImages([])
        for( const key of imageKeys ){
            if(!key) continue;
            const image = await localforage.getItem(key);
            if(image){
                setImages(images => [...images, image])
            }
        }
    }
    
    useEffect(() =>{
        getOfflineImages()
    }, [imageKeys] );

    const onDeleteClick = async (image) => {
        try {
            await localforage.removeItem(image.id);
            updateImageKeys(
                prev=> prev.filter(img => img.id == image.id )
            )
            queryClient.invalidateQueries({
                queryKey: ["offlineImageKeys", project._id],
            });
        }
        catch (error) {
            console.error("Error deleting image from localForage:", error);
        }   
    }

    if(!images || images.length === 0) {
        return null;
    }
    console.log(images)

    return (
        <Stack className=" border border-gray-200 p-2 rounded bg-gray-200">
            <Text className="text-gray-700 text-sm font-semibold">Offline Images - Pending Upload</Text>
            <Stack horizontal className="gap-4">
                {images?.map((image) => (
                    <ImageThumbnail 
                        key={image.id}
                        image={image}
                        onImageClick={onImageClick}
                        onDeleteClick={onDeleteClick}
                    />
                ))}
            </Stack>
        </Stack>
    );
};
