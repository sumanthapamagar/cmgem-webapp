import { Modal } from "../../../../../../../components";

export const ImageViewerModal = ({ visibleImage, onClose }) => {
    if (!visibleImage) return null;
    
    return (
        <Modal
            open={!!visibleImage}
            hideDialog={onClose}
            size="xl"
        >
            <div className="flex justify-center items-center p-4">
                <img
                    src={visibleImage}
                    className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
                    alt="image"
                    style={{ maxHeight: '90vh' }}
                />
            </div>
        </Modal>
    );
};
