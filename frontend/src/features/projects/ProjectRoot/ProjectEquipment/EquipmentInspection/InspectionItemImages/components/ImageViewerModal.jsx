import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Dialog, DialogBody, Stack, Text } from "../../../../../../../components";
import { deleteAttachment } from "../../../../../../../lib/api";
import { useState } from "react";
import { useParams } from "react-router-dom";
import localforage from "localforage";

export const ImageViewerModal = ({ fileUrl, imageId, isOnlineImage, hideImageDialog  }) => {
    const queryClient = useQueryClient()
    const {projectId, equipmentId} = useParams()
    const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false)
    const [isDeleted, setIsDeleted] = useState(false)

    const { mutate: deleteFromServer } = useMutation({
        mutationFn:  () => deleteAttachment(imageId),
        onSuccess : () => {
            setIsDeleted(true)
            setIsDeleteConfirmationVisible(false)
            queryClient.invalidateQueries({
                queryKey: ['equipment-attachments', equipmentId]
            })
        }
    });
    
    const deleteFromLocalStorage = async () => {
        await localforage.removeItem(imageId);
        const queryKey = ["offlineImageKeys", projectId]
        const imageKeys = queryClient.getQueryData(queryKey)?? []
        queryClient.setQueryData(queryKey,
            [
                ...imageKeys
                .filter(key=>key!= imageId)
            ]
        )
        setIsDeleted(true)
        setIsDeleteConfirmationVisible(false)

    }

    const deleteImage = async() => {
        return isOnlineImage ? deleteFromServer(): deleteFromLocalStorage();
    }

    return (
        <Dialog
            open={!!fileUrl }
            onClose={hideImageDialog}
            size="xl"
        >
            <DialogBody>
                <Stack className="gap-4">
                    <Stack horizontal className=" justify-end gap-4">
                        {!isDeleted && (
                            <Button className="w-8 h-8 bg-red-400" onClick={()=> setIsDeleteConfirmationVisible(true)}>
                                <i className="fa-solid fa-trash"></i>
                            </Button>
                        )}
                        <Button plain className="w-8 h-8" onClick={hideImageDialog} >
                            <i className="fa-solid fa-xmark"></i>
                        </Button>
                    </Stack>
                    {
                        (isDeleteConfirmationVisible ) && (
                            <Stack className="items-center">
                                <Text>Please Confirm to delete the picture</Text>
                                <Stack horizontal className=" justify-end gap-4">
                                    <Button plain   onClick={()=> setIsDeleteConfirmationVisible(false)}>
                                        Cancel
                                    </Button>
                                    <Button  onClick={deleteImage} >
                                        Confirm and Delete
                                    </Button>
                                </Stack>
                    
                            </Stack>
                        )
                    }
                    {
                        isDeleted ? (
                            <Text className="text-center text-large text-emerald-400">Image deleted succssfully</Text>
                        ) : (
                            <div className="flex justify-center items-center p-4">
                                <img
                                    src={fileUrl}
                                    className="max-w-full max-h-[75vh] w-auto h-auto object-contain"
                                    alt="image"
                                />
                            </div>
                        )
                    }

                </Stack>
            </DialogBody>
        </Dialog>
    );
};
