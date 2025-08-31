import { Injectable, BadRequestException, Logger } from '@nestjs/common';

// Try to import sharp, but handle failures gracefully
let sharp: any;
try {
  sharp = require('sharp');
} catch (error) {
  console.warn('Warning: Sharp module could not be loaded. Image processing will be limited.');
}

export interface ImageSizes {
  icon: { width: number; height: number };
  thumbnail: { width: number; height: number };
  original: { width: number; height: number };
}

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
}

@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);
  private readonly imageSizes: ImageSizes = {
    icon: { width: 64, height: 64 },
    thumbnail: { width: 600, height: 600 },
    original: { width: 1920, height: 1080 } // Max dimensions for original
  };

  async processImage(
    fileBuffer: Buffer,
    originalFilename: string
  ): Promise<{
    icon: ProcessedImage;
    thumbnail: ProcessedImage;
    original: ProcessedImage;
  }> {
    // Check if sharp is available
    if (!sharp) {
      this.logger.warn('Sharp module not available. Returning original image without processing.');
      return this.createFallbackImages(fileBuffer);
    }

    try {
      // Validate file is an image
      const metadata = await sharp(fileBuffer).metadata();
      
      if (!metadata.format || !['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format)) {
        throw new BadRequestException('Invalid image format. Supported formats: JPEG, PNG, WebP');
      }

      // Process icon size (64x64, fit inside, maintain aspect ratio)
      const iconBuffer = await sharp(fileBuffer)
        .resize(this.imageSizes.icon.width, this.imageSizes.icon.height, {
          fit: 'inside',
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Process thumbnail size (300x300, fit inside, maintain aspect ratio)
      const thumbnailBuffer = await sharp(fileBuffer)
        .resize(this.imageSizes.thumbnail.width, this.imageSizes.thumbnail.height, {
          fit: 'inside',
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Process original size (max dimensions, maintain aspect ratio)
      const originalBuffer = await sharp(fileBuffer)
        .resize(this.imageSizes.original.width, this.imageSizes.original.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 90 })
        .toBuffer();

      // Get metadata for processed images
      const iconMetadata = await sharp(iconBuffer).metadata();
      const thumbnailMetadata = await sharp(thumbnailBuffer).metadata();
      const originalMetadata = await sharp(originalBuffer).metadata();

      return {
        icon: {
          buffer: iconBuffer,
          width: iconMetadata.width || this.imageSizes.icon.width,
          height: iconMetadata.height || this.imageSizes.icon.height,
          format: 'jpeg'
        },
        thumbnail: {
          buffer: thumbnailBuffer,
          width: thumbnailMetadata.width || this.imageSizes.thumbnail.width,
          height: thumbnailMetadata.height || this.imageSizes.thumbnail.height,
          format: 'jpeg'
        },
        original: {
          buffer: originalBuffer,
          width: originalMetadata.width || this.imageSizes.original.width,
          height: originalMetadata.height || this.imageSizes.original.height,
          format: 'jpeg'
        }
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Failed to process image with sharp: ${error.message}`);
      this.logger.warn('Falling back to original image without processing.');
      
      return this.createFallbackImages(fileBuffer);
    }
  }

  private createFallbackImages(fileBuffer: Buffer) {
    // Return the same image for all sizes when sharp is not available
    return {
      icon: {
        buffer: fileBuffer,
        width: this.imageSizes.icon.width,
        height: this.imageSizes.icon.height,
        format: 'jpeg'
      },
      thumbnail: {
        buffer: fileBuffer,
        width: this.imageSizes.thumbnail.width,
        height: this.imageSizes.thumbnail.height,
        format: 'jpeg'
      },
      original: {
        buffer: fileBuffer,
        width: this.imageSizes.original.width,
        height: this.imageSizes.original.height,
        format: 'jpeg'
      }
    };
  }

  generateUniqueFilename(originalFilename: string, suffix: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = '.jpg'; // Always convert to JPEG for consistency
    return `${timestamp}_${randomString}_${suffix}${extension}`;
  }
}
