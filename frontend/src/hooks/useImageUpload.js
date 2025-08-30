import { useState } from 'react';
import { useImageMutation } from './index';

export const useImageUpload = (projectId, equipmentId) => {
    const [images, setImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    
    const uploadImage = useImageMutation({
        projectId,
        equipmentId
    });

    const onSelectImages = async (ev) => {
        const selectedFiles = ev.target?.files;
        if (selectedFiles?.length > 0) {
            const newImages = Array.from(selectedFiles).map((file) => ({
                url: URL.createObjectURL(file),
                file,
                isUploading: false,
                isUploaded: false,
                isUploadError: false
            }));
            setImages((prevImages) => [...prevImages, ...newImages]);
        }
    };

    const removeImage = (idx) => {
        setImages(images.filter((img, idx2) => idx2 != idx));
    };

    const uploadAllImages = async (inspectionItem) => {
        setIsUploading(true);
        
        const uploadPromises = images
            .filter((file) => !file.isUploaded && !file.isUploading)
            .map(async (file, idx) => {
                // Mark as uploading
                setImages(prev => prev.map((img, i) => 
                    i === idx ? { ...img, isUploading: true, isUploadError: false } : img
                ));

                try {
                    await uploadImage.mutateAsync({
                        file: file.file,
                        equipmentId: inspectionItem.equipmentId,
                        data: {
                            group_id: inspectionItem.location,
                            inspection_item: inspectionItem._id
                        }
                    });
                    
                    // Mark as uploaded
                    setImages(prev => prev.map((img, i) => 
                        i === idx ? { ...img, isUploading: false, isUploaded: true } : img
                    ));
                } catch (error) {
                    // Mark as error
                    setImages(prev => prev.map((img, i) => 
                        i === idx ? { ...img, isUploading: false, isUploadError: true } : img
                    ));
                    console.error('Upload failed for image:', error);
                }
            });

        await Promise.all(uploadPromises);
        setIsUploading(false);
    };

    return { 
        images, 
        setImages, 
        isUploading, 
        uploadAllImages, 
        removeImage, 
        onSelectImages 
    };
};
