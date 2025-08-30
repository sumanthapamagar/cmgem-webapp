import { Global, Module } from '@nestjs/common';
import { MsGraphService } from './msgraph.service';
import { StorageService } from './storage.service';

@Global()
@Module({
  providers: [ MsGraphService, StorageService],
  exports: [ MsGraphService, StorageService],
})
export class CommonModule {}
