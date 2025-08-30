import { IsString, IsNumber, IsOptional, IsMongoId, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateMaintenanceDto {
  @IsOptional()
  @IsString()
  current_provider?: string;

  @IsOptional()
  @IsString()
  total_inspections_last_12_months?: string;

  @IsOptional()
  @IsString()
  total_calls_last_12_months?: string;

  @IsOptional()
  @IsString()
  annual_safety_visit_date?: string;
}

export class CreateLiftInformationDto {
  @IsOptional()
  @IsString()
  lift_number?: string;

  @IsOptional()
  @IsString()
  installation_date?: string;

  @IsOptional()
  @IsString()
  original_equipment_manufacturer?: string;

  @IsOptional()
  @IsString()
  lift_type?: string;

  @IsOptional()
  @IsString()
  drive_system?: string;

  @IsOptional()
  @IsString()
  applicable_code?: string;

  @IsOptional()
  @IsString()
  load?: string;

  @IsOptional()
  @IsString()
  speed?: string;

  @IsOptional()
  @IsString()
  floor_served_front?: string;

  @IsOptional()
  @IsString()
  floor_served_rear?: string;

  @IsOptional()
  @IsString()
  hoist_rope_size?: string;

  @IsOptional()
  @IsString()
  governer_rope_size?: string;
}

export class CreateLiftCarDto {
  @IsOptional()
  @IsString()
  car_interior?: string;

  @IsOptional()
  @IsString()
  car_door_finish?: string;

  @IsOptional()
  @IsString()
  car_door_type?: string;

  @IsOptional()
  @IsString()
  car_signalisation?: string;
}

export class CreateLandingDto {
  @IsOptional()
  @IsString()
  fire_rated_landing_doors?: string;

  @IsOptional()
  @IsString()
  landing_signalisation_type?: string;

  @IsOptional()
  @IsString()
  no_of_landing_button_risers?: string;

  @IsOptional()
  @IsString()
  landing_doors_frame_finishes?: string;
}

export class CreateLiftShaftDto {
  @IsOptional()
  @IsString()
  liftwell_construiction?: string;

  @IsOptional()
  @IsString()
  vents_in_liftwell?: string;

  @IsOptional()
  @IsString()
  sprinklers_smoke_detectors?: string;

  @IsOptional()
  @IsString()
  ledges_in_liftwell?: string;

  @IsOptional()
  @IsString()
  false_pit_floors?: string;

  @IsOptional()
  @IsString()
  building_services_in_liftwell?: string;

  @IsOptional()
  @IsString()
  sprinklers_in_pit?: string;
}

export class CreateMachineRoomDto {
  @IsOptional()
  @IsString()
  machine_room_location?: string;

  @IsOptional()
  @IsString()
  machine_room_ventilation?: string;

  @IsOptional()
  @IsString()
  lift_submain_type_and_number_of?: string;

  @IsOptional()
  @IsString()
  machinery_access_hatch?: string;

  @IsOptional()
  @IsString()
  building_services_in_machine_room?: string;

  @IsOptional()
  @IsString()
  lifting_beams_with_rated_load_visible?: string;

  @IsOptional()
  @IsString()
  fire_extinguisher?: string;

  @IsOptional()
  @IsString()
  sprinkllers_smoke_detectors?: string;
}

export class CreateCarInteriorDto {
  @IsOptional()
  @IsString()
  wall_type?: string;

  @IsOptional()
  @IsString()
  ceiling_and_lights_type?: string;

  @IsOptional()
  @IsString()
  flooring_type?: string;

  @IsOptional()
  @IsString()
  mirror_location?: string;

  @IsOptional()
  @IsString()
  handrails?: string;

  @IsOptional()
  @IsString()
  buttons_type?: string;

  @IsOptional()
  @IsString()
  indication_type?: string;

  @IsOptional()
  @IsString()
  voice_announcement?: string;

  @IsOptional()
  @IsString()
  car_door_finishes?: string;

  @IsOptional()
  @IsString()
  car_door_type?: string;
}

export class CreateEquipmentDto {
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
  category: string;

  @IsString()
  name: string;

  @IsNumber()
  start_floor: number;

  @IsNumber()
  floors_served: number;

  @IsMongoId()
  project_id: string;

  @ValidateNested()
  @Type(() => CreateMaintenanceDto)
  maintenance: CreateMaintenanceDto;

  @ValidateNested()
  @Type(() => CreateLiftInformationDto)
  lift: CreateLiftInformationDto;

  @ValidateNested()
  @Type(() => CreateLiftCarDto)
  lift_car: CreateLiftCarDto;

  @ValidateNested()
  @Type(() => CreateLandingDto)
  landings: CreateLandingDto;

  @ValidateNested()
  @Type(() => CreateLiftShaftDto)
  lift_shaft: CreateLiftShaftDto;

  @IsObject()
  checklists: Record<string, any>;

  @ValidateNested()
  @Type(() => CreateMachineRoomDto)
  machine_room: CreateMachineRoomDto;

  @ValidateNested()
  @Type(() => CreateCarInteriorDto)
  car_interior: CreateCarInteriorDto;

}
