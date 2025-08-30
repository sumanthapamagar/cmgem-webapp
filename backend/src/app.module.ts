import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './modules/accounts/accounts.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { EquipmentsModule } from './modules/equipments/equipments.module';
import { ChecklistsModule } from './modules/checklists/checklists.module';
import { ReportsModule } from './modules/reports/reports.module';
import { FloorsModule } from './modules/floors/floors.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { StorageModule } from './modules/storage/storage.module';
import { CommonModule } from './common/common.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/cmgem', {
      connectionName: 'default',
      dbName: process.env.MONGODB_DATABASE || 'cmgem',
    }),
    AuthModule,
    CommonModule,
    AccountsModule,
    ProjectsModule,
    EquipmentsModule,
    ChecklistsModule,
    ReportsModule,
    FloorsModule,
    AttachmentsModule,
    StorageModule,
  ],
})
export class AppModule {}
