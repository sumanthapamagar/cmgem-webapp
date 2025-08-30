import { Types } from 'mongoose';
import { AttachmentResponseDto } from 'src/modules/attachments/dto';
import { EquipmentResponseDto } from 'src/modules/equipments/dto';
import { FloorResponseDto } from 'src/modules/floors/dto';
import type { UserInfo } from 'src/types/user.types';

export interface EquipmentWithFloors extends EquipmentResponseDto {
  floors_served_front_rear: string;
  floors: Array<FloorResponseDto>;
  attachments: Array<AttachmentResponseDto>;
}

export interface ProjectDetailResponseDto {
  _id: Types.ObjectId;
  name: string;
  category: string;
  account_id: Types.ObjectId;
  account?: {
    _id: Types.ObjectId;
    name: string;
    description?: string;
    address?: {
      street_1: string;
      street_2?: string;
      city: string;
      post_code: string;
      state: string;
      country: string;
    };
    phone?: string;
    fax?: string;
    website?: string;
    created_at?: Date;
    updated_at?: Date;
  };
  address: {
    street_1: string;
    street_2?: string;
    city: string;
    post_code: string;
    state: string;
    country: string;
    text: string;
  };
  inspection_date: Date;
  is_test: boolean;
  created_by?: UserInfo;
  updated_by?: UserInfo;
  deleted_by?: UserInfo;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
  
  // Related equipments with their floors
  equipments: Array<EquipmentWithFloors>;
}
