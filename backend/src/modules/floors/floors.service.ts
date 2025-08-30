import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Floor, FloorDocument } from './floors.schema';
import { CreateFloorDto } from './dto/create-floor.dto';
import { FloorResponseDto } from './dto/floor-response.dto';
import type { UserInfo } from 'src/types/user.types';

@Injectable()
export class FloorsService {
  constructor(
    @InjectModel(Floor.name, 'default') private floorModel: Model<FloorDocument>,
  ) { }

  async bulkSave(floors: CreateFloorDto[], user: UserInfo): Promise<Floor[]> {

    const savedFloors: Floor[] = [];

    for (const floor of floors) {
      floor._id = new Types.ObjectId(floor._id);
      const existingFloor = await this.floorModel.findOne({
        _id: floor._id,
        deleted_at: { $exists: false }
      }).exec();

      if (existingFloor) {
        const updatedFloor = await this.floorModel.findByIdAndUpdate(floor._id, {
          ...floor,

          updated_by: user
        }, { new: true, runValidators: true }).exec();

        if (!updatedFloor) {
          throw new NotFoundException(`Floor with ID ${floor._id} not found`);
        }

        savedFloors.push(updatedFloor);
      } else {
        const newFloor = await new this.floorModel({
          ...floor,
          created_by: user,
        }).save();

        if (!newFloor) {
          throw new NotFoundException(`Floor with ID ${floor._id} not found`);
        }
        savedFloors.push(newFloor);
      }
    }

    return savedFloors;
  }

  async findAll(
    equipmentId?: string,
    level?: number,
    designation?: string,
    sortBy: string = 'level',
    sortOrder: string = 'asc'
  ): Promise<FloorResponseDto[]> {
    const filter: any = { deleted_at: { $exists: false } };

    if (equipmentId) {
      filter.equipment_id = equipmentId;
    }

    if (level !== undefined) {
      filter.level = level;
    }

    if (designation) {
      filter.designation = { $regex: designation, $options: 'i' };
    }

    // Remove MongoDB sorting and execute query without sort
    const floors = await this.floorModel.find(filter).exec();

    // Apply sorting in the service function after the query response
    const sortedFloors = floors.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle numeric sorting for fields like 'level'
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

    return sortedFloors.map(floor => this.mapToResponseDto(floor));
  }

  async findById(id: string): Promise<FloorResponseDto> {
    const floor = await this.floorModel.findOne({
      _id: new Types.ObjectId(id),
      deleted_at: { $exists: false }
    }).exec();

    if (!floor) {
      throw new NotFoundException(`Floor with ID ${id} not found`);
    }

    return this.mapToResponseDto(floor);
  }

  async create(createFloorDto: CreateFloorDto, user: UserInfo): Promise<FloorResponseDto> {
    const newFloor = new this.floorModel({
      ...createFloorDto,
      equipment_id: createFloorDto.equipment_id,
      created_by: user,
      created_at: new Date(),
    });

    const savedFloor = await newFloor.save();
    return this.mapToResponseDto(savedFloor);
  }

  async update(id: string, updateFloorDto: CreateFloorDto, user: UserInfo): Promise<FloorResponseDto> {
    const floor = await this.floorModel.findOne({
      _id: new Types.ObjectId(id),
      deleted_at: { $exists: false }
    }).exec();

    if (!floor) {
      throw new NotFoundException(`Floor with ID ${id} not found`);
    }

    const updateData: any = {
      ...updateFloorDto,
      updated_by: user,
      updated_at: new Date(),
    };

    // equipment_id is already a string, no conversion needed

    const updatedFloor = await this.floorModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).exec();

    if (!updatedFloor) {
      throw new NotFoundException(`Failed to update floor with ID ${id}`);
    }

    return this.mapToResponseDto(updatedFloor);
  }

  async delete(id: string, user: UserInfo): Promise<void> {
    const floor = await this.floorModel.findOne({
      _id: new Types.ObjectId(id),
      deleted_at: { $exists: false }
    }).exec();

    if (!floor) {
      throw new NotFoundException(`Floor with ID ${id} not found`);
    }

    await this.floorModel.findByIdAndUpdate(id, {
      deleted_by: user,
      deleted_at: new Date(),
    }).exec();
  }

  async findByEquipmentId(equipmentId: string): Promise<FloorResponseDto[]> {
    const floors = await this.floorModel.find({
      equipment_id: equipmentId,
      deleted_at: { $exists: false }
    }).exec();

    return floors.map(floor => this.mapToResponseDto(floor));
  }

  async findMultipleByEquipmentIds(equipmentIds: string[]): Promise<FloorResponseDto[]> {
    if (!equipmentIds || equipmentIds.length === 0) {
      return [];
    }

    const floors = await this.floorModel.find({
      equipment_id: { $in: equipmentIds },
      deleted_at: { $exists: false }
    }).exec();

    return floors.map(floor => this.mapToResponseDto(floor));
  }

  async findByLevel(level: number): Promise<FloorResponseDto[]> {
    const floors = await this.floorModel.find({
      level: level,
      deleted_at: { $exists: false }
    }).exec();

    return floors.map(floor => this.mapToResponseDto(floor));
  }

  private mapToResponseDto(floor: FloorDocument): FloorResponseDto {
    return {
      _id: floor._id.toString(),
      equipment_id: floor.equipment_id,
      level: floor.level,
      designation: floor.designation,
      door_opening: floor.door_opening,
      floor_levelling: floor.floor_levelling,
      landing_call_button: floor.landing_call_button,
      landing_chime: floor.landing_chime,
      landing_indication: floor.landing_indication,
      floor_comment: floor.floor_comment,
      signalisation_comment: floor.signalisation_comment,
      created_by: floor.created_by,
      updated_by: floor.updated_by,
      deleted_by: floor.deleted_by,
      created_at: floor.created_at,
      updated_at: floor.updated_at,
      deleted_at: floor.deleted_at,
    };
  }
}
