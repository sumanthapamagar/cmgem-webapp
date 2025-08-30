import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Checklist, ChecklistDocument } from './checklists.schema';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { ChecklistResponseDto } from './dto/checklist-response.dto';
import type { UserInfo } from 'src/types/user.types';
import { CacheService } from '../../common/cache.service';

@Injectable()
export class ChecklistsService {
  constructor(
    @InjectModel(Checklist.name, 'default') private checklistModel: Model<ChecklistDocument>,
    private cacheService: CacheService,
  ) {}

  async findAll(): Promise<ChecklistResponseDto[]> {
    // Try to get from cache first
    const cached = await this.cacheService.getChecklists();
    if (cached && cached.length > 0) {
      return cached;
    }

    // If not in cache, fetch from database
    const checklists = await this.checklistModel
      .find({ deleted_at: { $exists: false } })
      .exec();
    
    // Map to response DTOs and sort by order in memory
    const mappedChecklists = checklists
      .map(checklist => this.mapToResponseDto(checklist))
      .sort((a, b) => (a.order || 1000) - (b.order || 1000));
    
    // Cache the result for 30 minutes (1800 seconds)
    await this.cacheService.setChecklists(mappedChecklists, 1800);
    
    return mappedChecklists;
  }

  async findAllWithVersion(): Promise<{ checklists: ChecklistResponseDto[], version: string }> {
    // Try to get from cache first
    const cached = await this.cacheService.getChecklists();
    if (cached && cached.length > 0) {
      // Generate version based on cache timestamp
      const version = await this.cacheService.getChecklistsVersion() || new Date().toISOString();
      return { checklists: cached, version };
    }

    // If not in cache, fetch from database
    const checklists = await this.checklistModel
      .find({ deleted_at: { $exists: false } })
      .exec();
    
    // Map to response DTOs and sort by order in memory
    const mappedChecklists = checklists
      .map(checklist => this.mapToResponseDto(checklist))
      .sort((a, b) => (a.order || 1000) - (b.order || 1000));
    
    // Generate version timestamp
    const version = new Date().toISOString();
    
    // Cache the result for 30 minutes (1800 seconds)
    await this.cacheService.setChecklists(mappedChecklists, 1800);
    await this.cacheService.setChecklistsVersion(version, 1800);
    
    return { checklists: mappedChecklists, version };
  }

  async findById(id: string): Promise<ChecklistResponseDto> {
    const checklist = await this.checklistModel.findOne({ 
      _id: new Types.ObjectId(id), 
      deleted_at: { $exists: false } 
    }).exec();
    
    if (!checklist) {
      throw new NotFoundException(`Checklist with ID ${id} not found`);
    }
    
    return this.mapToResponseDto(checklist);
  }

  async create(createChecklistDto: CreateChecklistDto, user: UserInfo): Promise<ChecklistResponseDto> {
    // Create the document without explicitly setting _id
    const checklistData = {
      ...createChecklistDto,
      created_by: user,
      created_at: new Date(),
    };
    
    const savedChecklist = await this.checklistModel.create(checklistData);
    
    // Invalidate cache when new checklist is created
    await this.cacheService.invalidateChecklists();
    
    return this.mapToResponseDto(savedChecklist);
  }

  async updateMany(updateChecklistsDto: Array<{ id: string; order: number }>, user: UserInfo): Promise<void> {
    const updatePromises = updateChecklistsDto.map(async (updateDto) => {
      const checklist = await this.checklistModel.findOne({ 
        _id: new Types.ObjectId(updateDto.id), 
        deleted_at: { $exists: false } 
      }).exec();
      
      if (!checklist) {
        throw new NotFoundException(`Checklist with ID ${updateDto.id} not found`);
      }

      return this.checklistModel.findByIdAndUpdate(
        updateDto.id,
        {
          order: updateDto.order,
          updated_by: user,
          updated_at: new Date(),
        },
        { new: true }
      ).exec();
    });

    await Promise.all(updatePromises);

    // Invalidate cache when checklists are updated
    await this.cacheService.invalidateChecklists();
  }

  async update(id: string, updateChecklistDto: CreateChecklistDto, user: UserInfo): Promise<ChecklistResponseDto> {
    const checklist = await this.checklistModel.findOne({ 
      _id: new Types.ObjectId(id), 
      deleted_at: { $exists: false } 
    }).exec();
    
    if (!checklist) {
      throw new NotFoundException(`Checklist with ID ${id} not found`);
    }

    const updatedChecklist = await this.checklistModel.findByIdAndUpdate(
      id,
      {
        ...updateChecklistDto,
        updated_by: user,
        updated_at: new Date(),
      },
      { new: true }
    ).exec();

    if (!updatedChecklist) {
      throw new NotFoundException(`Failed to update checklist with ID ${id}`);
    }

    // Invalidate cache when checklist is updated
    await this.cacheService.invalidateChecklists();

    return this.mapToResponseDto(updatedChecklist);
  }

  async delete(id: string, user: UserInfo): Promise<void> {
    const checklist = await this.checklistModel.findOne({ 
      _id: new Types.ObjectId(id), 
      deleted_at: { $exists: false } 
    }).exec();
    
    if (!checklist) {
      throw new NotFoundException(`Checklist with ID ${id} not found`);
    }

    await this.checklistModel.findByIdAndUpdate(id, {
      deleted_by: user,
      deleted_at: new Date(),
    }).exec();

    // Invalidate cache when checklist is deleted
    await this.cacheService.invalidateChecklists();
  }

  async findByEquipmentType(equipmentType: string): Promise<ChecklistResponseDto[]> {
    // Get all checklists from cache and filter by equipment type
    const allChecklists = await this.findAll();
    return allChecklists.filter(checklist => 
      checklist.equipment_type.toLowerCase().includes(equipmentType.toLowerCase())
    );
  }

  async findByLocation(location: string): Promise<ChecklistResponseDto[]> {
    // Get all checklists from cache and filter by location
    const allChecklists = await this.findAll();
    return allChecklists.filter(checklist => 
      checklist.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  async findByEquipmentTypeAndLocation(equipmentType: string, location: string): Promise<ChecklistResponseDto[]> {
    // Get all checklists from cache and filter by equipment type and location
    const allChecklists = await this.findAll();
    return allChecklists.filter(checklist => 
      checklist.equipment_type.toLowerCase().includes(equipmentType.toLowerCase()) &&
      checklist.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  private mapToResponseDto(checklist: ChecklistDocument): ChecklistResponseDto {
    return {
      _id: checklist._id?.toString() || '',
      equipment_type: checklist.equipment_type,
      title: checklist.title,
      description: checklist.description,
      order: checklist.order,
      location: checklist.location,
      category: checklist.category,
      created_by: checklist.created_by,
      updated_by: checklist.updated_by,
      deleted_by: checklist.deleted_by,
      created_at: checklist.created_at,
      updated_at: checklist.updated_at,
      deleted_at: checklist.deleted_at,
    };
  }
}
