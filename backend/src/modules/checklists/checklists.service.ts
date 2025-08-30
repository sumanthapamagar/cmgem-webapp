import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Checklist, ChecklistDocument } from './checklists.schema';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { ChecklistResponseDto } from './dto/checklist-response.dto';
import type { UserInfo } from 'src/types/user.types';

@Injectable()
export class ChecklistsService {
  constructor(
    @InjectModel(Checklist.name, 'default') private checklistModel: Model<ChecklistDocument>,
  ) {}

  async findAll(
    equipmentType?: string, 
    location?: string, 
    category?: string, 
    title?: string,
    sortBy: string = 'order',
    sortOrder: string = 'asc'
  ): Promise<ChecklistResponseDto[]> {
    const filter: any = { deleted_at: { $exists: false } };
    
    if (equipmentType) {
      filter.equipment_type = { $regex: equipmentType, $options: 'i' };
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }
    
    // Remove MongoDB sorting and execute query without sort
    const checklists = await this.checklistModel.find(filter).exec();
    
    // Apply sorting in the service function after the query response
    const sortedChecklists = checklists.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle numeric sorting for fields like 'order'
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
        if (sortOrder === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      // Handle date sorting
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortOrder === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
      }
      
      // Default case - no sorting
      return 0;
    });
    
    return sortedChecklists.map(checklist => this.mapToResponseDto(checklist));
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
    const newChecklist = new this.checklistModel({
      ...createChecklistDto,
      created_by: user,
      created_at: new Date(),
    });
    
    const savedChecklist = await newChecklist.save();
    return this.mapToResponseDto(savedChecklist);
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
  }

  async findByEquipmentType(equipmentType: string): Promise<ChecklistResponseDto[]> {
    const checklists = await this.checklistModel.find({ 
      equipment_type: equipmentType, 
      deleted_at: { $exists: false } 
    }).exec();
    
    return checklists.map(checklist => this.mapToResponseDto(checklist));
  }

  async findByLocation(location: string): Promise<ChecklistResponseDto[]> {
    const checklists = await this.checklistModel.find({ 
      location: location, 
      deleted_at: { $exists: false } 
    }).exec();
    
    return checklists.map(checklist => this.mapToResponseDto(checklist));
  }

  private mapToResponseDto(checklist: ChecklistDocument): ChecklistResponseDto {
    return {
      _id: checklist._id.toString(),
      equipment_type: checklist.equipment_type,
      title: checklist.title,
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
