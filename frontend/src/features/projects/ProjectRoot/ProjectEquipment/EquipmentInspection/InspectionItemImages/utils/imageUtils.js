export const processImageUrls = (attachments, token, inspectionItemId) => {
    if (!token || !attachments) return [];
    
    return attachments
        .filter((img) => img.inspection_item === inspectionItemId)
        .map((img) => ({
            ...img,
            thumb_url: `${img.thumb_url}?${token}`,
            low_size_url: `${img.low_size_url}?${token}`,
            large_url: `${img.large_url}?${token}`,
            url: `${img.url}?${token}`
        }));
};

export const createImageObject = (file) => ({
    url: URL.createObjectURL(file),
    file,
    isUploading: false,
    isUploaded: false,
    isUploadError: false
});
