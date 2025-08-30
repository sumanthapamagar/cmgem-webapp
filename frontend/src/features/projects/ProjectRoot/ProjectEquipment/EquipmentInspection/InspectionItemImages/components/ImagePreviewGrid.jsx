import { Stack } from "../../../../../../../components";
import { Offline, Online, LoadingState } from "../../../../../../../components";

export const ImagePreviewGrid = ({ images, onRemoveImage, isUploading }) => {
    return (
        <Stack horizontal className="gap-2">
            {images.length > 0 &&
                images.map((img, idx) => (
                    <div className="relative rounded-sm overflow-hidden" key={idx}>
                        <img
                            src={img.url}
                            className="h-24 cursor-pointer"
                            alt="image upload in progress"
                        />
                        <button
                            variant="outline"
                            className="absolute top-1 right-1 bg-white/50 p-2 rounded-sm"
                            onClick={() => onRemoveImage(idx)}
                        >
                            <i className="fa-solid fa-trash"></i>
                        </button>
                        {!!img.isUploading && (
                            <>
                                <Offline>
                                    <div className="absolute top-auto bottom-0 text-red-500 inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
                                        <i className="fa-fw fa-circle-check fa-regular" />
                                        Waiting for network
                                    </div>
                                </Offline>
                                <Online>
                                    <div className="absolute top-auto bottom-0 text-white inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
                                        <LoadingState />
                                        Uploading
                                    </div>
                                </Online>
                            </>
                        )}
                        {!!img.isUploaded && (
                            <div className="absolute top-auto bottom-0 text-white inset-0 bg-green-500 bg-opacity-75 transition-opacity">
                                <i className="fa-fw fa-circle-check fa-solid" />
                                Uploaded successfully
                            </div>
                        )}
                        {!!img.isUploadError && (
                            <div className="absolute top-auto bottom-0 text-red-500 inset-0 bg-red-500 bg-opacity-75 transition-opacity">
                                <i className="fa-fw fa-circle-xmark fa-solid" />
                                Error Uploading
                            </div>
                        )}
                    </div>
                ))}
        </Stack>
    );
};
