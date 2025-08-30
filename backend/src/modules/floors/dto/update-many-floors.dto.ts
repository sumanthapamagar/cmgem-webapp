import { IsArray, IsString, IsOptional, IsNumber, ValidateNested, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class FloorUpdateItemDto {
  @IsMongoId()
  _id: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsNumber()
  level?: number;

  @IsOptional()
  @IsString()
  door_opening?: string;

  @IsOptional()
  @IsString()
  floor_levelling?: string;

  @IsOptional()
  @IsString()
  landing_call_button?: string;

  @IsOptional()
  @IsString()
  landing_chime?: string;

  @IsOptional()
  @IsString()
  landing_indication?: string;

  @IsOptional()
  @IsString()
  floor_comment?: string;

  @IsOptional()
  @IsString()
  signalisation_comment?: string;
}

export class UpdateManyFloorsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FloorUpdateItemDto)
  floors: FloorUpdateItemDto[];
}
