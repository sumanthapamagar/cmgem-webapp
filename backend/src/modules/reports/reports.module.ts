import { Module } from '@nestjs/common';
import { ReportsService, ReportsServiceFactory } from './reports.service';
import { ExcelService } from './excel.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [ReportsServiceFactory, ExcelService],
  exports: [ReportsServiceFactory, ExcelService],
})
export class ReportsModule {}
