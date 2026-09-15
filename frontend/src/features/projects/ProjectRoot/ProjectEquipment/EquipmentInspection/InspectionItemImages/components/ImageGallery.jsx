import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Stack } from "../../../../../../../components";
import { ImageThumbnail } from "./ImageThumbnail";
import { useEquipmentAttachments } from "../../../../../../../hooks/useEquipmentAttachments";
import { useSasToken } from "../../../../../../../hooks/useSASToken";
import { processImageUrls } from "../utils/imageUtils";


export const ImageGallery = ({ 
    inspectionItem, 
}) => {
    const {equipmentId} = useParams();

    const sasTokenQuery = useSasToken(equipmentId);
    
    const equipmentAttachmentsQuery = useEquipmentAttachments(equipmentId);

    const token = sasTokenQuery.data?.sas_token;
    
    const uploadedImages = useMemo(() =>
        processImageUrls(equipmentAttachmentsQuery.data?.attachments || [], token, inspectionItem._id),
        [equipmentAttachmentsQuery.data?.attachments, token, inspectionItem._id]
    );
    
    return (
        <Stack horizontal className="gap-4">
            {uploadedImages?.map((image) => (
                <ImageThumbnail 
                    key={image._id}
                    isOnlineImage={true}
                    image={image}
                />
            ))}
        </Stack>
    );
};
