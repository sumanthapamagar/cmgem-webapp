import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EquipmentsController } from './equipments.controller';
import { EquipmentsService } from './equipments.service';
import { Equipment, EquipmentSchema } from './equipments.schema';
import { FloorsModule } from '../floors/floors.module';
import { AttachmentsModule } from '../attachments/attachments.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Equipment.name, schema: EquipmentSchema }
    ], 'default'),
    FloorsModule,
    AttachmentsModule
  ],
  controllers: [EquipmentsController],
  providers: [EquipmentsService],
  exports: [EquipmentsService],
})
export class EquipmentsModule {}
