import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { StorageService } from './storage.service';
import { UserInterceptor } from 'src/interceptors';
import type { UserInfo } from 'src/types/user.types';
import { GetUserInfo } from 'src/decorators';

@Controller('storage')
@UseInterceptors(UserInterceptor)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('sas-token/:containerName')
  async getSASToken(
    @Param('containerName') containerName: string,
    @Query('expiry_hours') expiryHours: number = 24,
    @GetUserInfo() user: UserInfo
  ): Promise<{ sas_token: string }> {
    try {
      const sasToken = await this.storageService.generateContainerSASToken(
        containerName,
        Number(expiryHours)
      );
      
      return { sas_token: sasToken };
    } catch (error) {
      console.error('Controller error generating SAS token:', error);
      throw error;
    }
  }

}
