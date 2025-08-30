import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export enum SortField {
  TITLE = 'title',
  EQUIPMENT_TYPE = 'equipment_type',
  LOCATION = 'location',
  CATEGORY = 'category',
  ORDER = 'order',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at'
}

export class ChecklistQueryDto {
  @IsOptional()
  @IsString()
  equipment_type?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(SortField)
  sortBy?: SortField = SortField.ORDER;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;
}
