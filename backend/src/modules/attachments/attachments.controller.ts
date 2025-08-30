import { Controller, Get, Delete, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { AttachmentResponseDto, ManyAttachmentsResponseDto } from './dto';
import { UserInterceptor } from 'src/interceptors';
import type { UserInfo } from 'src/types/user.types';
import { GetUserInfo } from 'src/decorators';

@Controller('attachments')
@UseInterceptors(UserInterceptor)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Get('equipment/:equipmentId')
  async getEquipmentAttachments(
    @Param('equipmentId') equipmentId: string
  ): Promise<ManyAttachmentsResponseDto> {
    return this.attachmentsService.getEquipmentAttachments(equipmentId);
  }

  @Delete(':id')
  async deleteAttachment(
    @Param('id') id: string,
    @GetUserInfo() user: UserInfo
  ): Promise<void> {
    return this.attachmentsService.deleteAttachment(id, user);
  }
}
