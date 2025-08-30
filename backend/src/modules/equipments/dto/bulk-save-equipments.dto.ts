import { IsString, IsOptional, IsArray, ValidateNested, IsMongoId } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CreateEquipmentDto } from './create-equipment.dto';
import { CreateFloorDto } from '../../floors/dto/create-floor.dto';
import { Types } from 'mongoose';
import { UserInfo } from 'src/types/user.types';


export class CreateEquipmentWithFloorsDto extends CreateEquipmentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFloorDto)
  floors: CreateFloorDto[];
}