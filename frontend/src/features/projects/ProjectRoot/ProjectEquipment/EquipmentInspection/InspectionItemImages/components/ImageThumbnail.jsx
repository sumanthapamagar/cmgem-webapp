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
    if (hasError) {
        return (
            <ImageErrorFallback 
                image={image} 
                onClick={() => onImageClick(image.large_url)} 
            />
        );
    }
    
    return (
        <div className="relative rounded-sm overflow-hidden">
            <img
                src={image.thumb_url || image.low_size_url || image.large_url}
                className="h-12 cursor-pointer"
                alt="image"
                onError={onImageError}
                onLoad={onImageLoad}
                onClick={() => onImageClick(image.large_url)}
            />
            <DeleteButton onClick={() => onDeleteClick(image)} />
        </div>
    );
};
