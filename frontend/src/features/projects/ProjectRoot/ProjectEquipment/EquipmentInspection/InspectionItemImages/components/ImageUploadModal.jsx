import { Button, Modal, Stack } from '../../../../../../../components';
import { ImagePreviewGrid } from './ImagePreviewGrid';

export const ImageUploadModal = ({ 
    images, 
    onClose, 
    onUpload, 
    onRemoveImage,
    isUploading 
}) => {
    return (
        <Modal open={true} hideDialog={onClose}>
            <Stack className="gap-4">
                <ImagePreviewGrid 
                    images={images} 
                    onRemoveImage={onRemoveImage}
                    isUploading={isUploading}
                />
                <div className="text-center">
                    <Button
                        onClick={onUpload}
                        disabled={isUploading}
                    >
                        Upload Selected images
                    </Button>
                </div>
            </Stack>
        </Modal>
    );
};
