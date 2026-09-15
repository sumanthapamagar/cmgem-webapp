import { Online, Stack } from "../../../../../../components";
import { ImageGallery, UploadButton } from "./components";
import { OfflineImageGallary } from "./components/OfflineImageGallary";

export function InspectionImages({ inspectionItem }) {
    return (
        <Stack className="gap-2 h-full place-content-end">
            <OfflineImageGallary
                inspectionItem={inspectionItem} 
            />
            <UploadButton
                inspectionItem={inspectionItem} 
            />
        </Stack>
    );
}
