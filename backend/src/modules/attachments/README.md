# Attachments Module - Image Upload

This module handles image uploads for equipment, automatically processing images into three different sizes and storing them in Azure Blob Storage.

## Features

- **Automatic Image Processing**: Converts uploaded images to three sizes:
  - **Icon**: 64x64 pixels (for small displays)
  - **Thumbnail**: 300x300 pixels (for previews)
  - **Original**: Max 1920x1080 pixels (maintained aspect ratio)
- **Azure Storage Integration**: Automatically uploads to Azure Blob Storage
- **Database Storage**: Saves file references in the attachments collection
- **Multiple File Support**: Handles both single and multiple image uploads

## API Endpoints

### Single Image Upload
```
POST /equipments/:id/images
Content-Type: multipart/form-data

Body:
- file: Image file (JPEG, PNG, WebP)
- group_id: Optional group identifier
- inspection_item: Optional inspection item reference
- description: Optional description
```

### Multiple Images Upload
```
POST /equipments/:id/multiple-images
Content-Type: multipart/form-data

Body:
- files: Array of image files (up to 10)
- group_id: Optional group identifier
- inspection_item: Optional inspection item reference
- description: Optional description
```

## Response Format

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "attachment": {
    "_id": "attachment_id",
    "low_size_url": "https://storage.blob.core.windows.net/container/icon.jpg",
    "low_size_name": "icon_filename.jpg",
    "thumb_url": "https://storage.blob.core.windows.net/container/thumb.jpg",
    "thumb_name": "thumb_filename.jpg",
    "large_url": "https://storage.blob.core.windows.net/container/original.jpg",
    "large_name": "original_filename.jpg",
    "equipment_id": "equipment_id",
    "group_id": "optional_group_id",
    "inspection_item": "optional_inspection_item",
    "created_by": { "user_info" },
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

All images are automatically converted to JPEG format for consistency and storage optimization.

## Storage Structure

Images are stored in Azure Blob Storage under the `equipment-images` container with the following naming convention:
- `{timestamp}_{random}_{base}.jpg` - Original size
- `{timestamp}_{random}_{icon}.jpg` - Icon size
- `{timestamp}_{random}_{thumb}.jpg` - Thumbnail size

## Dependencies

- **Sharp**: Image processing library
- **Azure Storage Blob**: Cloud storage integration
- **Mongoose**: Database operations

## Configuration

Ensure the following environment variables are set:
- `AZURE_STORAGE_ACCOUNT_NAME`
- `AZURE_STORAGE_ACCOUNT_KEY`

## Error Handling

The service includes comprehensive error handling for:
- Invalid file formats
- Missing files
- Invalid equipment IDs
- Storage upload failures
- Database operation failures
