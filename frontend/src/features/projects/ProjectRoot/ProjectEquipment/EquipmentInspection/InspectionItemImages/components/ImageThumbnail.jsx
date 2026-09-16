import { useState } from 'react';
import { ImageViewerModal } from './ImageViewerModal';

export const ImageThumbnail = ({ 
    image, 
    onImageError, 
    onImageLoad,
    isOnlineImage = trie
}) => {

    const [isImageDialogvisible, setIsImageDialogvisible] = useState(false)

    const fileUrl = image.file ? URL.createObjectURL(image.file) : image.large_url;
    const thumbnailSrc = image.thumbnail_url || fileUrl;

    const showImageDialog = () => setIsImageDialogvisible(true)
    const hideImageDialog = () => setIsImageDialogvisible(false)

    return (
        <div className="relative rounded-sm overflow-hidden">
            <img
                src = {thumbnailSrc}
                className = "h-12 cursor-pointer"
                alt = "image"
                onError = {onImageError}
                onLoad = {onImageLoad}
                onClick = {showImageDialog}
            />
            {isImageDialogvisible  && (
                <ImageViewerModal
                    isOnlineImage = {isOnlineImage}
                    fileUrl = {fileUrl}
                    imageId = {image.id ?? image._id}
                    hideImageDialog = {hideImageDialog}
                />
            )}
        </div>
    );
};
