import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, Query, UseInterceptors } from '@nestjs/common';
import { ChecklistsService } from './checklists.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { ChecklistResponseDto } from './dto/checklist-response.dto';
import { ChecklistQueryDto } from './dto/checklist-query.dto';
import { UserInterceptor } from 'src/interceptors';
import { GetUserInfo } from 'src/decorators';
import type { UserInfo } from 'src/types/user.types';

@Controller('checklists')
@UseInterceptors(UserInterceptor)
export class ChecklistsController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Get()
  async findAll(@Query() query: ChecklistQueryDto): Promise<ChecklistResponseDto[]> {
    return this.checklistsService.findAll(
      query.equipment_type, 
      query.location, 
      query.category, 
      query.title,
      query.sortBy,
      query.sortOrder
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ChecklistResponseDto> {
    return this.checklistsService.findById(id);
  }

  @Post()
  async create(
    @Body() createChecklistDto: CreateChecklistDto,
    @GetUserInfo() user: UserInfo
  ): Promise<ChecklistResponseDto> {
    return this.checklistsService.create(createChecklistDto, user);
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

  @Get('equipment-type/:equipmentType')
  async findByEquipmentType(@Param('equipmentType') equipmentType: string): Promise<ChecklistResponseDto[]> {
    return this.checklistsService.findByEquipmentType(equipmentType);
  }

  @Get('location/:location')
  async findByLocation(@Param('location') location: string): Promise<ChecklistResponseDto[]> {
    return this.checklistsService.findByLocation(location);
  }
}
