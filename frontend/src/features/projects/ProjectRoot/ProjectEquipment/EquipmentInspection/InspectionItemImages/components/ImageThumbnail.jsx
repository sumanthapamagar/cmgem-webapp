import { DeleteButton } from './DeleteButton';
import { ImageErrorFallback } from './ImageErrorFallback';

export const ImageThumbnail = ({ 
    image, 
    onImageClick, 
    onDeleteClick, 
    hasError, 
    onImageError, 
    onImageLoad 
}) => {


    const fileUrl = image.file ? URL.createObjectURL(image.file) : image.large_url;
    const thumbnailSrc = image.thumbnail_url || fileUrl;


    if (hasError) {
        return (
            <ImageErrorFallback 
                image={image} 
                onClick={() => onImageClick( image.large_url)} 
            />
        );
    }
    
    return (
        <div className="relative rounded-sm overflow-hidden">
            <img
                src={thumbnailSrc}
                className="h-12 cursor-pointer"
                alt="image"
                onError={onImageError}
                onLoad={onImageLoad}
                onClick={() => onImageClick(fileUrl)}
            />
            <DeleteButton onClick={() => onDeleteClick(image)} iconColor="text-red-400" />
        </div>
    );
};
