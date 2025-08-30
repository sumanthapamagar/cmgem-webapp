import { IsOptional, IsString, IsMongoId } from 'class-validator';

export class EquipmentQueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  equipment_type?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsMongoId()
  project_id?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
