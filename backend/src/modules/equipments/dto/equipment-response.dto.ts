
import type { UserInfo } from 'src/types/user.types';

export class MaintenanceResponseDto {
  current_provider?: string;
  total_inspections_last_12_months?: string;
  total_calls_last_12_months?: string;
  annual_safety_visit_date?: string;
}

export class LiftInformationResponseDto {
  lift_number?: string;
  installation_date?: string;
  original_equipment_manufacturer?: string;
  lift_type?: string;
  drive_system?: string;
  applicable_code?: string;
  load?: string;
  speed?: string;
  floor_served_front?: string;
  floor_served_rear?: string;
  hoist_rope_size?: string;
  governer_rope_size?: string;
}

export class LiftCarResponseDto {
  car_interior?: string;
  car_door_finish?: string;
  car_door_type?: string;
  car_signalisation?: string;
}

export class LandingResponseDto {
  fire_rated_landing_doors?: string;
  landing_signalisation_type?: string;
  no_of_landing_button_risers?: string;
  landing_doors_frame_finishes?: string;
}

export class LiftShaftResponseDto {
  liftwell_construiction?: string;
  vents_in_liftwell?: string;
  sprinklers_smoke_detectors?: string;
  ledges_in_liftwell?: string;
  false_pit_floors?: string;
  building_services_in_liftwell?: string;
  sprinklers_in_pit?: string;
}

export class MachineRoomResponseDto {
  machine_room_location?: string;
  machine_room_ventilation?: string;
  lift_submain_type_and_number_of?: string;
  machinery_access_hatch?: string;
  building_services_in_machine_room?: string;
  lifting_beams_with_rated_load_visible?: string;
  fire_extinguisher?: string;
  sprinkllers_smoke_detectors?: string;
}

export class CarInteriorResponseDto {
  wall_type?: string;
  ceiling_and_lights_type?: string;
  flooring_type?: string;
  mirror_location?: string;
  handrails?: string;
  buttons_type?: string;
  indication_type?: string;
  voice_announcement?: string;
  car_door_finishes?: string;
  car_door_type?: string;
}

export class EquipmentResponseDto {
  _id: string;
  category: string;
  name: string;
  start_floor: number;
  floors_served: number;
  project_id: string;
  maintenance?: MaintenanceResponseDto;
  lift?: LiftInformationResponseDto;
  lift_car?: LiftCarResponseDto;
  landings?: LandingResponseDto;
  lift_shaft?: LiftShaftResponseDto;
  checklists?: Record<string, any>;
  machine_room?: MachineRoomResponseDto;
  car_interior?: CarInteriorResponseDto;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
  created_by?: UserInfo;
  updated_by?: UserInfo;
  deleted_by?: UserInfo;
}

export class ManyEquipmentsResponseDto {
  equipments: EquipmentResponseDto[];
  equipments_count: number;
}
