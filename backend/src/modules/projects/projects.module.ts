import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project, ProjectSchema } from './projects.schema';
import { Equipment, EquipmentSchema } from '../equipments/equipments.schema';
import { Floor, FloorSchema } from '../floors/floors.schema';
import { Attachment, AttachmentSchema } from '../attachments/attachments.schema';
import { ReportsModule } from '../reports/reports.module';
import { ChecklistsModule } from '../checklists/checklists.module';
import { EquipmentsModule } from '../equipments/equipments.module';
import { AttachmentsModule } from '../attachments/attachments.module';
import { FloorsModule } from '../floors/floors.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Equipment.name, schema: EquipmentSchema },
      { name: Floor.name, schema: FloorSchema },
      { name: Attachment.name, schema: AttachmentSchema }
    ], 'default'),
    ReportsModule,
    ChecklistsModule,
    EquipmentsModule,
    AttachmentsModule,
    FloorsModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
