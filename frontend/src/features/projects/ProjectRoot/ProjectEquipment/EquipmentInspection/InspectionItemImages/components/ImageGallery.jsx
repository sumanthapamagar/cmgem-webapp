import { Stack, LoadingState } from "../../../../../../../components";
import { ImageThumbnail } from "./ImageThumbnail";


export const ImageGallery = ({ 
    images, 
    onImageClick, 
    onDeleteClick, 
    imageLoadErrors, 
    onImageError, 
    onImageLoad,
    sasTokenQuery,
    token,
    equipment
}) => {
    return (
        <Stack horizontal className="gap-4">
            {images?.map((image) => (
                <ImageThumbnail 
                    key={image._id}
                    image={image}
                    onImageClick={onImageClick}
                    onDeleteClick={onDeleteClick}
                    hasError={imageLoadErrors.has(image._id)}
                    onImageError={onImageError}
                    onImageLoad={onImageLoad}
                />
            ))}
            
            {/* Show loading state when token is being fetched */}
            {sasTokenQuery.isLoading && (
                <div className="h-12 w-16 bg-gray-100 flex border border-gray-200">
                    <LoadingState />
                </div>
            )}
            
            {/* Show message when no images or token not available */}
            {!sasTokenQuery.isLoading && images.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-2">
                    {!token ? 'Preparing storage access...' : 'No images uploaded yet'}
                </div>
            )}
            
            {/* Show error state when SAS token query fails */}
            {sasTokenQuery.isError && (
                <div className="text-center text-red-500 text-sm py-2 border border-red-200 rounded bg-red-50">
                    <i className="fa-solid fa-exclamation-triangle fa-fw mr-2"></i>
                    Failed to load storage access. Please refresh the page.
                    {sasTokenQuery.error && (
                        <div className="text-xs mt-1">
                            Error: {sasTokenQuery.error.message}
                        </div>
                    )}
                </div>
            )}
        </Stack>
    );
};
