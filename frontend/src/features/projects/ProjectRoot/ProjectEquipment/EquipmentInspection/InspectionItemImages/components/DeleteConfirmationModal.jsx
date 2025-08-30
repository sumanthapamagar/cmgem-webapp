import { Button, Modal, Stack } from "../../../../../../../components";

export const DeleteConfirmationModal = ({ 
    imageToDelete, 
    onClose, 
    onConfirm 
}) => {
    if (!imageToDelete) return null;
    
    return (
        <Modal
            open={!!imageToDelete}
            hideDialog={onClose}
        >
            <h3 className="font-medium text-large">
                Confirm to delete the selected image
            </h3>
            <div className="text-center my-8">
                <img
                    src={imageToDelete.large_url}
                    className="h-40 cursor-pointer rounded-sm"
                    alt="image"
                />
            </div>
            <Stack horizontal className="gap-4 contents-end">
                <Button
                    variant="outline"
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button onClick={onConfirm}>
                    Confirm and Delete
                </Button>
            </Stack>
        </Modal>
    );
};
