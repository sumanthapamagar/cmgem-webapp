import { IsOptional, IsString, IsNumber } from 'class-validator';

export class FloorQueryDto {
  @IsOptional()
  @IsString()
  equipment_id?: string;

  @IsOptional()
  @IsNumber()
  level?: number;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: string;
}
