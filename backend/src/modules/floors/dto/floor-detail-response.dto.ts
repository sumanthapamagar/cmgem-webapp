
import type { UserInfo } from 'src/types/user.types';

export class FloorDetailResponseDto {
  _id: string;
  equipment_id: string;
  level: number;
  designation: string;
  door_opening?: string;
  floor_levelling?: string;
  landing_call_button?: string;
  landing_chime?: string;
  landing_indication?: string;
  floor_comment?: string;
  signalisation_comment?: string;
  created_by?: UserInfo;
  updated_by?: UserInfo;
  deleted_by?: UserInfo;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
  
  // Related equipment data
  equipment?: {
    _id: string;
    category: string;
    name: string;
    start_floor: number;
    floors_served: number;
    project_id: string;
    created_at: Date;
    updated_at?: Date;
    deleted_at?: Date;
  };
  
  // Related floors for the same equipment
  related_floors?: Array<{
    _id: string;
    level: number;
    designation: string;
    door_opening?: string;
    floor_levelling?: string;
    landing_call_button?: string;
    landing_chime?: string;
    landing_indication?: string;
    floor_comment?: string;
    signalisation_comment?: string;
    created_at?: Date;
    updated_at?: Date;
  }>;
}
