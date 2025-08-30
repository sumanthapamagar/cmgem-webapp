import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { ImageProcessingService } from './image-processing.service';

@Module({
  imports: [
    ConfigModule
  ],
  controllers: [StorageController],
  providers: [StorageService, ImageProcessingService],
  exports: [StorageService, ImageProcessingService]
})
export class StorageModule {}
