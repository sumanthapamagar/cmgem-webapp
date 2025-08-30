import { Controller,  Post, Param, Body, Delete, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { EquipmentsService } from './equipments.service';
import { 
  CreateEquipmentWithFloorsDto,
} from './dto';
import { UploadImageDto } from '../attachments/dto';
import { UserInterceptor } from 'src/interceptors';
import type { UserInfo } from 'src/types/user.types';
import { GetUserInfo } from 'src/decorators';

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

@Controller('equipments')
@UseInterceptors(UserInterceptor)
export class EquipmentsController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  @Post('bulk-save')
  async bulkSave(
    @Body() equipments: CreateEquipmentWithFloorsDto[],
    @GetUserInfo() user: UserInfo
  ): Promise<any> {
    return this.equipmentsService.bulkSave(equipments, user);
  }

  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImages(
    @Param('id') id: string,
    @Body() uploadData: UploadImageDto,
    @UploadedFile() file: MulterFile,
    @GetUserInfo() user: UserInfo
  ): Promise<any> {
    console.log('File received:', file);
    console.log('Uploading images for equipment:', id, 'Data:', uploadData, 'User:', user);
    return this.equipmentsService.uploadImages(id, file, uploadData, user);
  }

  @Post(':id/multiple-images')
  @UseInterceptors(FilesInterceptor('files', 10)) // Allow up to 10 files
  async uploadMultipleImages(
    @Param('id') id: string,
    @Body() uploadData: UploadImageDto,
    @UploadedFiles() files: MulterFile[],
    @GetUserInfo() user: UserInfo
  ): Promise<any> {
    console.log('Files received:', files);
    console.log('Uploading multiple images for equipment:', id, 'Data:', uploadData, 'User:', user);
    return this.equipmentsService.uploadMultipleImages(id, files, uploadData, user);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @GetUserInfo() user: UserInfo
  ): Promise<void> {
    return this.equipmentsService.delete(id, user);
  }

}
