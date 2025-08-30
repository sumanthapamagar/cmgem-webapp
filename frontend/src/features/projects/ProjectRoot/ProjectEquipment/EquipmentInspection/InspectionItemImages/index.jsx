import { useContext, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Stack } from "../../../../../../components";
import {
    ImageGallery,
    ImageUploadModal,
    DeleteConfirmationModal,
    ImageViewerModal,
    UploadButton,
    DebugInfo
} from "./components";
import { ProjectContext } from "../../../../projectContext";
import { useSasToken } from "../../../../../../hooks/useSASToken";
import { processImageUrls } from "./utils/imageUtils";
import { useImageUpload } from "../../../../../../hooks/useImageUpload";
import { deleteAttachment, patchEquipment } from "../../../../../../lib/api";

export function InspectionImages({ inspectionItem }) {
    const { equipmentId } = useParams();
    const { offlineProject: project } = useContext(ProjectContext);

    const sasTokenQuery = useSasToken(equipmentId);
    const equipment = useMemo(() =>
        project?.equipments?.find((eq) => eq._id == equipmentId),
        [project?.equipments, equipmentId]
    );

    const token = sasTokenQuery.data?.sas_token;
    const uploadedImages = useMemo(() =>
        processImageUrls(equipment?.attachments, token, inspectionItem._id),
        [equipment?.attachments, token, inspectionItem._id]
    );

    const { images, setImages, isUploading, uploadAllImages, removeImage, onSelectImages } =
        useImageUpload(project._id, equipmentId);

    const [visibleImage, setVisibleImage] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(false);
    const [imageLoadErrors, setImageLoadErrors] = useState(new Set());

    // Handle image load errors
    const handleImageError = (imageId) => {
        setImageLoadErrors(prev => new Set(prev).add(imageId));
    };

    // Handle image load success
    const handleImageLoad = (imageId) => {
        setImageLoadErrors(prev => {
            const newSet = new Set(prev);
            newSet.delete(imageId);
            return newSet;
        });
    };

    const { mutate: deleteImage } = useMutation({
        mutationFn: async (id) => {
            const res = await deleteAttachment(id);
            // Update local equipment state after successful deletion
            const updatedAttachments = equipment.attachments.filter((a) => a._id != id);
            await patchEquipment(project._id, equipmentId, {
                attachments: updatedAttachments
            });
            setImageToDelete(null);
            return res;
        }
    });

    const handleUploadAllImages = () => {
        uploadAllImages({
            ...inspectionItem,
            equipmentId
        });
    };

    const handleCloseUploadModal = () => {
        setImages([]);
    };

    const handleCloseImageModal = () => {
        setVisibleImage(false);
    };

    const handleCloseDeleteModal = () => {
        setImageToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (imageToDelete) {
            deleteImage(imageToDelete._id);
        }
    };

    return (
        <Stack className="gap-2 h-full place-content-end">
            <ImageGallery
                images={uploadedImages}
                onImageClick={setVisibleImage}
                onDeleteClick={setImageToDelete}
                imageLoadErrors={imageLoadErrors}
                onImageError={handleImageError}
                onImageLoad={handleImageLoad}
                sasTokenQuery={sasTokenQuery}
                token={token}
                equipment={equipment}
            />

            <DebugInfo uploadedImages={uploadedImages} token={token} />

            <UploadButton onSelectImages={onSelectImages} />

            {/* Image Viewer Modal */}
            <ImageViewerModal
                visibleImage={visibleImage}
                onClose={handleCloseImageModal}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                imageToDelete={imageToDelete}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
            />

            {/* Image Upload Modal */}
            {images.length > 0 && (
                <ImageUploadModal
                    images={images}
                    onClose={handleCloseUploadModal}
                    onUpload={handleUploadAllImages}
                    onRemoveImage={removeImage}
                    isUploading={isUploading}
                />
            )}
        </Stack>
    );
}
