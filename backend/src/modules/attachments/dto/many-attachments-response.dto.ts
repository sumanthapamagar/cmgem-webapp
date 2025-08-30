import { IsArray, IsNumber } from 'class-validator';
import { AttachmentResponseDto } from './attachment-response.dto';

export class ManyAttachmentsResponseDto {
  @IsArray()
  attachments: AttachmentResponseDto[];

  @IsNumber()
  attachments_count: number;
}
