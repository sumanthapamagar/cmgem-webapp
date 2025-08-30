import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CreateFloorDto {
  
  @IsString()
  @IsMongoId()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return new Types.ObjectId(value);
    }
    return value;
  })
  _id: Types.ObjectId;

  @IsString()
  equipment_id: string;

  @IsNumber()
  level: number;

  @IsString()
  designation: string;

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
