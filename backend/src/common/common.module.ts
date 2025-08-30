import { Global, Module } from '@nestjs/common';
import { MsGraphService } from './msgraph.service';
import { StorageService } from './storage.service';
import { CacheService } from './cache.service';

@Global()
@Module({
  providers: [MsGraphService, StorageService, CacheService],
  exports: [MsGraphService, StorageService, CacheService],
})
export class CommonModule {}
