import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateChecklistDto {
  // Base fields from checklist class
  @IsString()
  equipment_type: string;
  @IsString()
  title: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  category?: string;
}
