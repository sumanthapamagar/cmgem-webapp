import { Controller, Get, Post, Patch, Delete, Param, Body, UseInterceptors, Query } from '@nestjs/common';
import { ChecklistsService } from './checklists.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { ChecklistResponseDto } from './dto/checklist-response.dto';
import { UserInterceptor } from 'src/interceptors';
import { GetUserInfo } from 'src/decorators';
import type { UserInfo } from 'src/types/user.types';

@Controller('checklists')
@UseInterceptors(UserInterceptor)
export class ChecklistsController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Get()
  async findAll(
    @Query('equipment_type') equipmentType?: string,
    @Query('location') location?: string
  ): Promise<ChecklistResponseDto[]> {
    if (equipmentType && location) {
      return this.checklistsService.findByEquipmentTypeAndLocation(equipmentType, location);
    } else if (equipmentType) {
      return this.checklistsService.findByEquipmentType(equipmentType);
    } else if (location) {
      return this.checklistsService.findByLocation(location);
    }
    return this.checklistsService.findAll();
  }

  @Get('with-version')
  async findAllWithVersion(): Promise<{ checklists: ChecklistResponseDto[], version: string }> {
    try {
      return this.checklistsService.findAllWithVersion();
    } catch (error) {
      console.error('Error fetching checklists with version:', error);
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ChecklistResponseDto> {
    return this.checklistsService.findById(id);
  }


  @Post()
  async create(
    @Body() createChecklistDto: CreateChecklistDto,
    @GetUserInfo() user: UserInfo
  ): Promise<ChecklistResponseDto> {
    return this.checklistsService.create(createChecklistDto, user);
  }

  @Patch()
  async updateMany(
    @Body() updateChecklistsDto: Array<{ id: string; order: number }>,
    @GetUserInfo() user: UserInfo
  ): Promise<void> {
    return this.checklistsService.updateMany(updateChecklistsDto, user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateChecklistDto: CreateChecklistDto,
    @GetUserInfo() user: UserInfo
  ): Promise<ChecklistResponseDto> {
    return this.checklistsService.update(id, updateChecklistDto, user);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @GetUserInfo() user: UserInfo
  ): Promise<void> {
    return this.checklistsService.delete(id, user);
  }
}
