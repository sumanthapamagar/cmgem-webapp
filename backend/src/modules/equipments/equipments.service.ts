import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Equipment, EquipmentDocument } from './equipments.schema';
import {
  EquipmentResponseDto,
  CreateEquipmentWithFloorsDto
} from './dto';
import type { UserInfo } from 'src/types/user.types';
import { FloorsService } from '../floors/floors.service';
import { CreateFloorDto } from '../floors/dto';
import { AttachmentsService } from '../attachments/attachments.service';
import { UploadImageDto } from '../attachments/dto';

// Define the file type explicitly to avoid TypeScript issues
type MulterFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
};

@Injectable()
export class EquipmentsService {
  constructor(
    @InjectModel(Equipment.name, 'default') private equipmentModel: Model<EquipmentDocument>,
    private readonly floorsService: FloorsService,
    private readonly attachmentsService: AttachmentsService,
  ) { }


  async findById(id: string): Promise<EquipmentResponseDto> {
    const equipment = await this.equipmentModel.findOne({
      _id: new Types.ObjectId(id),
      deleted_at: { $exists: false }
    }).exec();

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    return this.mapToResponseDto(equipment);
  }

  async findByProjectId(projectId: string): Promise<EquipmentResponseDto[]> {
    const equipments = await this.equipmentModel.find({
      project_id: projectId,
      deleted_at: { $exists: false }
    }).exec();
    return equipments.map(equipment => this.mapToResponseDto(equipment));
  }

  async findMultipleByIds(equipmentIds: string[]): Promise<EquipmentResponseDto[]> {
    if (!equipmentIds || equipmentIds.length === 0) {
      return [];
    }

    const objectIds = equipmentIds.map(id => new Types.ObjectId(id));
    const equipments = await this.equipmentModel.find({
      _id: { $in: objectIds },
      deleted_at: { $exists: false }
    }).exec();

    return equipments.map(equipment => this.mapToResponseDto(equipment));
  }

  // Debug method to check all equipments including deleted ones
  async findAllIncludingDeleted(projectId: string): Promise<any[]> {
    const allEquipments = await this.equipmentModel.find({
      project_id: projectId
    }).exec();
    
    return allEquipments.map(equipment => ({
      _id: equipment._id,
      name: equipment.name,
      deleted_at: equipment.deleted_at,
      deleted_by: equipment.deleted_by
    }));
  }

  async delete(id: string, user: UserInfo): Promise<void> {
    console.log('deleting equipment', id);
    const equipment = await this.equipmentModel.findOne({
      _id: new Types.ObjectId(id),
      deleted_at: { $exists: false }
    }).exec();

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    console.log('Equipment found, performing soft delete:', equipment._id);
    const result = await this.equipmentModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      {
        deleted_by: user,
        deleted_at: new Date(),
      },
      { new: true }
    ).exec();

    console.log('Soft delete result:', result);
    
    if (!result) {
      throw new NotFoundException(`Failed to delete equipment with ID ${id}`);
    }
  }

    async createOrUpdate(equipment: CreateEquipmentWithFloorsDto, user: UserInfo): Promise<Equipment> {

    const equipmentId = new Types.ObjectId(equipment._id);
    console.log('equipmentId', equipmentId);
    const existingEquipment = await this.equipmentModel.findOne({
      _id: equipmentId,
    }).exec();

    // Base equipment data without _id for creation
    const baseEquipmentData = {
      category: equipment.category,
      name: equipment.name,
      start_floor: equipment.start_floor,
      floors_served: equipment.floors_served,
      project_id: equipment.project_id,
      maintenance: equipment.maintenance,
      lift: equipment.lift,
      lift_car: equipment.lift_car,
      landings: equipment.landings,
      lift_shaft: equipment.lift_shaft,
      checklists: equipment.checklists,
      machine_room: equipment.machine_room,
      car_interior: equipment.car_interior,
    }

    if (existingEquipment) {
      console.log('updating equipment', equipmentId);
      // For updates, include the _id
      const updateData = {
        ...baseEquipmentData,
        updated_by: user,
      };
      
      const newEquipment = await this.equipmentModel.findByIdAndUpdate(
        equipmentId,
        updateData,
        { new: true, runValidators: true }
      ).exec();

      if (!newEquipment) {
        throw new NotFoundException(`Equipment with ID ${equipment._id} not found`);
      }

      console.log('updatedEquipment', equipmentId);
      return newEquipment;
    }
    console.log('creating equipment', equipmentId);


    // For creation, include the _id since auto: false in schema
    const newEquipment = await new this.equipmentModel({
      ...baseEquipmentData,
      _id: equipmentId,
      created_by: user,
    }).save();

    if (!newEquipment) {
      throw new NotFoundException(`Failed to create equipment with ID ${equipment._id}`);
    }
    console.log('createdEquipment', equipmentId);
    return newEquipment;
  }

  async bulkSave(
    equipments: CreateEquipmentWithFloorsDto[], // This data is already cleaned by plainToClass in controller
    user: UserInfo
  ): Promise<any> {

    // Process equipment updates in parallel
    const equipmentPromises = equipments.map(equipment => 
      this.createOrUpdate(equipment, user)
    );
    
    const updatedEquipments = await Promise.all(equipmentPromises);
    
    // Process floors in parallel
    const floors = equipments.flatMap(equipment => 
      equipment.floors.map(floor => ({
        ...floor,
        equipment_id: equipment._id.toString(),
      }))
    );

    await this.floorsService.bulkSave(floors, user);
    
    return {
      equipments: updatedEquipments,
      floors: floors,
    };
  }

  async uploadImages(
    id: string, 
    file: MulterFile, 
    uploadData: UploadImageDto, 
    user: UserInfo
  ): Promise<any> {
    console.log('uploading images', id, file, uploadData, user);
    
    // Use the attachments service to handle the image upload
    const attachment = await this.attachmentsService.uploadImage(
      id,
      file,
      uploadData,
      user
    );

    return {
      success: true,
      message: 'Image uploaded successfully',
      attachment: attachment
    };
  }

  async uploadMultipleImages(
    id: string, 
    files: MulterFile[], 
    uploadData: UploadImageDto, 
    user: UserInfo
  ): Promise<any> {
    console.log('uploading multiple images', id, files.length, uploadData, user);
    
    const uploadPromises = files.map(file => 
      this.attachmentsService.uploadImage(id, file, uploadData, user)
    );

    const attachments = await Promise.all(uploadPromises);

    return {
      success: true,
      message: `${files.length} images uploaded successfully`,
      attachments: attachments
    };
  }

  private mapToResponseDto(equipment: EquipmentDocument): EquipmentResponseDto {
    return {
      _id: equipment._id.toString(),
      category: equipment.category,
      name: equipment.name,
      start_floor: equipment.start_floor,
      floors_served: equipment.floors_served,
      project_id: equipment.project_id,
      maintenance: equipment.maintenance,
      lift: equipment.lift,
      lift_car: equipment.lift_car,
      landings: equipment.landings,
      lift_shaft: equipment.lift_shaft,
      checklists: equipment.checklists,
      machine_room: equipment.machine_room,
      car_interior: equipment.car_interior,
      created_at: equipment.created_at,
      updated_at: equipment.updated_at,
      deleted_at: equipment.deleted_at,
      created_by: equipment.created_by,
      updated_by: equipment.updated_by,
      deleted_by: equipment.deleted_by,
    };
  }
}
