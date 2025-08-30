import { IsString, IsOptional, IsDate, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
import type { UserInfo } from 'src/types/user.types';

export class AttachmentResponseDto {
  @IsMongoId()
  _id: any; // Mongoose automatically generates this

  @IsString()
  low_size_url: string;

  @IsString()
  low_size_name: string;

  @IsString()
  thumb_url: string;

  @IsString()
  thumb_name: string;

  @IsString()
  large_url: string;

  @IsString()
  large_name: string;

  @IsString()
  equipment_id: string;

  @IsOptional()
  @IsString()
  group_id?: string;

  @IsOptional()
  @IsString()
  inspection_item?: string;

  @IsOptional()
  @IsString()
  base64?: string;

  @IsOptional()
  created_by?: UserInfo;

  @IsDate()
  created_at: Date;

  @IsOptional()
  @IsDate()
  updated_at?: Date;

  @IsOptional()
  @IsDate()
  deleted_at?: Date;
}
