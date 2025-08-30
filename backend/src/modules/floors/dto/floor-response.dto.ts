
import type { UserInfo } from 'src/types/user.types';

export class FloorResponseDto {
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
}
