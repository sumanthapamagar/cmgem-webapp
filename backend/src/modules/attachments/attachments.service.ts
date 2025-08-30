import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attachment, AttachmentDocument } from './attachments.schema';
import { AttachmentResponseDto, ManyAttachmentsResponseDto, UploadImageDto } from './dto';
import { StorageService } from '../storage/storage.service';
import { ImageProcessingService } from '../storage/image-processing.service';
import type { UserInfo } from 'src/types/user.types';

// Define the file type explicitly to avoid TypeScript issues
type MulterFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
};

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectModel(Attachment.name, 'default') private attachmentModel: Model<AttachmentDocument>,
    private storageService: StorageService,
    private imageProcessingService: ImageProcessingService,
  ) { }

  async uploadImage(
    equipmentId: string,
    file: MulterFile,
    uploadData: UploadImageDto,
    user: UserInfo
  ): Promise<AttachmentResponseDto> {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      // Validate equipment ID format
      if (!Types.ObjectId.isValid(equipmentId)) {
        throw new BadRequestException('Invalid equipment ID format');
      }

      // Process the image to create three sizes
      const processedImages = await this.imageProcessingService.processImage(
        file.buffer,
        file.originalname
      );

      // Generate unique filenames for each size
      const baseFilename = this.imageProcessingService.generateUniqueFilename(
        file.originalname,
        'base'
      );
      const iconFilename = baseFilename.replace('_base.jpg', '_icon.jpg');
      const thumbnailFilename = baseFilename.replace('_base.jpg', '_thumb.jpg');

      // Upload all three sizes to Azure Storage
      const containerName = equipmentId;

      const [iconUpload, thumbnailUpload, originalUpload] = await Promise.all([
        this.storageService.uploadFile(
          containerName,
          iconFilename,
          processedImages.icon.buffer,
          'image/jpeg'
        ),
        this.storageService.uploadFile(
          containerName,
          thumbnailFilename,
          processedImages.thumbnail.buffer,
          'image/jpeg'
        ),
        this.storageService.uploadFile(
          containerName,
          baseFilename,
          processedImages.original.buffer,
          'image/jpeg'
        )
      ]);

      console.log({
        low_size_url: iconUpload.url,
        low_size_name: iconFilename,
        thumb_url: thumbnailUpload.url,
        thumb_name: thumbnailFilename,
        large_url: originalUpload.url,
        large_name: baseFilename,
        equipment_id: equipmentId,
        group_id: uploadData.group_id,
        inspection_item: uploadData.inspection_item,
        created_by: user,
      })

      // Create attachment record in database
      const attachmentData = {
        low_size_url: iconUpload.url,
        low_size_name: iconFilename,
        thumb_url: thumbnailUpload.url,
        thumb_name: thumbnailFilename,
        large_url: originalUpload.url,
        large_name: baseFilename,
        equipment_id: equipmentId,
        group_id: uploadData.group_id,
        inspection_item: uploadData.inspection_item,
        created_by: user,
        created_at: new Date(),
      };

      console.log('Creating attachment with data:', attachmentData);

      const attachment = new this.attachmentModel(attachmentData);

      console.log('Attachment model created:', attachment);

      const savedAttachment = await attachment.save();

      console.log('Attachment saved successfully:', savedAttachment);

      return this.mapToResponseDto(savedAttachment);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  async getEquipmentAttachments(equipmentId: string): Promise<ManyAttachmentsResponseDto> {
    // Validate equipment ID format
    if (!Types.ObjectId.isValid(equipmentId)) {
      throw new NotFoundException('Invalid equipment ID format');
    }

    const attachments = await this.attachmentModel
      .find({
        equipment_id: equipmentId,
        deleted_at: { $exists: false }
      })
      .sort({ created_at: -1 })
      .exec();

    const attachmentsCount = attachments.length;

    return {
      attachments: attachments.map(attachment => this.mapToResponseDto(attachment)),
      attachments_count: attachmentsCount
    };
  }

  async deleteAttachment(attachmentId: string, user: UserInfo): Promise<void> {
    // Validate attachment ID format
    if (!Types.ObjectId.isValid(attachmentId)) {
      throw new NotFoundException('Invalid attachment ID format');
    }

    const attachment = await this.attachmentModel.findById(attachmentId).exec();

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    // Soft delete by setting deleted_at and deleted_by
    await this.attachmentModel.findByIdAndUpdate(
      attachmentId,
      {
        deleted_at: new Date(),
        deleted_by: user
      }
    ).exec();
  }

  private mapToResponseDto(attachment: AttachmentDocument): AttachmentResponseDto {
    return {
      _id: attachment._id,
      low_size_url: attachment.low_size_url,
      low_size_name: attachment.low_size_name,
      thumb_url: attachment.thumb_url,
      thumb_name: attachment.thumb_name,
      large_url: attachment.large_url,
      large_name: attachment.large_name,
      equipment_id: attachment.equipment_id,
      group_id: attachment.group_id,
      inspection_item: attachment.inspection_item,
      base64: attachment.base64,
      created_by: attachment.created_by,
      created_at: attachment.created_at,
      updated_at: attachment.updated_at,
      deleted_at: attachment.deleted_at
    };
  }
}
