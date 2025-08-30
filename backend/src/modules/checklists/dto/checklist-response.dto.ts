import { IsString, IsOptional, IsDate, IsNumber, IsMongoId } from 'class-validator';
import type { UserInfo } from 'src/types/user.types';

export class ChecklistResponseDto {
  @IsMongoId()
  _id: string;

  // Base fields from checklist class
  @IsString()
  equipment_type: string;

  @IsString()
  title: string;

  @IsNumber()
  order: number;

  @IsString()
  location: string;

  @IsString()
  category: string;

  // Audit fields
  @IsOptional()
  created_by?: UserInfo;

  @IsOptional()
  updated_by?: UserInfo;

  @IsOptional()
  deleted_by?: UserInfo;

  @IsOptional()
  @IsDate()
  created_at?: Date;

  @IsOptional()
  @IsDate()
  updated_at?: Date;

  @IsOptional()
  @IsDate()
  deleted_at?: Date;
}
