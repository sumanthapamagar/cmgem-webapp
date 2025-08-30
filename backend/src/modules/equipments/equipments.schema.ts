import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { IsString, IsOptional, IsDate, IsEnum, IsArray, IsNumber, IsMongoId, IsBoolean } from 'class-validator';
import type { UserInfo } from 'src/types/user.types';

export type EquipmentDocument = Equipment;

// Nested schemas for equipment components
@Schema({ _id: false })
export class Maintenance {
  @Prop({ type: String, default: '' })
  current_provider?: string;

  @Prop({ type: String })
  total_inspections_last_12_months?: string;

  @Prop({ type: String })
  total_calls_last_12_months?: string;

  @Prop({ type: String })
  annual_safety_visit_date?: string;
}

@Schema({ _id: false })
export class InspectionItem {
  @Prop({ type: String })
  status?: string;

  @Prop({ type: String })
  comment?: string;
}

@Schema({ _id: false })
export class LiftInformation {
  @Prop({ type: String, default: '' })
  lift_number?: string;

  @Prop({ type: String, default: '' })
  installation_date?: string;

  @Prop({ type: String, default: '' })
  original_equipment_manufacturer?: string;

  @Prop({ type: String, default: '' })
  lift_type?: string;

  @Prop({ type: String, default: '' })
  drive_system?: string;

  @Prop({ type: String, default: '' })
  applicable_code?: string;

  @Prop({ type: String, default: '' })
  load?: string;

  @Prop({ type: String, default: '' })
  speed?: string;

  @Prop({ type: String, default: '' })
  floor_served_front?: string;

  @Prop({ type: String, default: '' })
  floor_served_rear?: string;

  @Prop({ type: String, default: '' })
  hoist_rope_size?: string;

  @Prop({ type: String, default: '' })
  governer_rope_size?: string;
}

@Schema({ _id: false })
export class LiftCar {
  @Prop({ type: String, default: '' })
  car_interior?: string;

  @Prop({ type: String, default: '' })
  car_door_finish?: string;

  @Prop({ type: String, default: '' })
  car_door_type?: string;

  @Prop({ type: String, default: '' })
  car_signalisation?: string;
}

@Schema({ _id: false })
export class Landing {
  @Prop({ type: String, default: '' })
  fire_rated_landing_doors?: string;

  @Prop({ type: String, default: '' })
  landing_signalisation_type?: string;

  @Prop({ type: String, default: '' })
  no_of_landing_button_risers?: string;

  @Prop({ type: String, default: '' })
  landing_doors_frame_finishes?: string;
}

@Schema({ _id: false })
export class LiftShaft {
  @Prop({ type: String, default: '' })
  liftwell_construiction?: string;

  @Prop({ type: String, default: '' })
  vents_in_liftwell?: string;

  @Prop({ type: String, default: '' })
  sprinklers_smoke_detectors?: string;

  @Prop({ type: String, default: '' })
  ledges_in_liftwell?: string;

  @Prop({ type: String, default: '' })
  false_pit_floors?: string;

  @Prop({ type: String, default: '' })
  building_services_in_liftwell?: string;

  @Prop({ type: String, default: '' })
  sprinklers_in_pit?: string;
}

@Schema({ _id: false })
export class MachineRoom {
  @Prop({ type: String, default: '' })
  machine_room_location?: string;

  @Prop({ type: String, default: '' })
  machine_room_ventilation?: string;

  @Prop({ type: String, default: '' })
  lift_submain_type_and_number_of?: string;

  @Prop({ type: String, default: '' })
  machinery_access_hatch?: string;

  @Prop({ type: String, default: '' })
  building_services_in_machine_room?: string;

  @Prop({ type: String, default: '' })
  lifting_beams_with_rated_load_visible?: string;

  @Prop({ type: String, default: '' })
  fire_extinguisher?: string;

  @Prop({ type: String, default: '' })
  sprinkllers_smoke_detectors?: string;
}

@Schema({ _id: false })
export class CarInterior {
  @Prop({ type: String, default: '' })
  wall_type?: string;

  @Prop({ type: String, default: '' })
  ceiling_and_lights_type?: string;

  @Prop({ type: String, default: '' })
  flooring_type?: string;

  @Prop({ type: String, default: '' })
  mirror_location?: string;

  @Prop({ type: String, default: '' })
  handrails?: string;

  @Prop({ type: String, default: '' })
  buttons_type?: string;

  @Prop({ type: String, default: '' })
  indication_type?: string;

  @Prop({ type: String, default: '' })
  voice_announcement?: string;

  @Prop({ type: String, default: '' })
  car_door_finishes?: string;

  @Prop({ type: String, default: '' })
  car_door_type?: string;
}

@Schema({ 
  timestamps: false,
  collection: 'equipments',
})
export class Equipment {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  start_floor: number;

  @Prop({ required: true })
  floors_served: number;

  @Prop({ type: String, required: true, ref: 'Project' })
  project_id: string;

  @Prop({ type: Maintenance, default: {} })
  maintenance?: Maintenance;

  @Prop({ type: LiftInformation, default: {} })
  lift?: LiftInformation;

  @Prop({ type: LiftCar, default: {} })
  lift_car?: LiftCar;

  @Prop({ type: Landing, default: {} })
  landings?: Landing;

  @Prop({ type: LiftShaft, default: {} })
  lift_shaft?: LiftShaft;

  @Prop({ type: Object, default: {} })
  checklists?: Record<string, any>;

  @Prop({ type: MachineRoom, default: {} })
  machine_room?: MachineRoom;

  @Prop({ type: CarInterior, default: {} })
  car_interior?: CarInterior;

  // MongoDB auto-generated fields
  @Prop({ type: Date, default: Date.now })
  created_at: Date;

  @Prop({ type: Date })
  updated_at?: Date;

  @Prop({ type: Date })
  deleted_at?: Date;

  @Prop({ type: Object })
  created_by?: UserInfo;

  @Prop({ type: Object })
  updated_by?: UserInfo;

  @Prop({ type: Object })
  deleted_by?: UserInfo;
}

export const EquipmentSchema = SchemaFactory.createForClass(Equipment);

// Add index for created_at field
EquipmentSchema.index({ created_at: -1 });

// Add index for project_id field
EquipmentSchema.index({ project_id: 1 });

// Pre-save hook to set updated_at
EquipmentSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updated_at = new Date();
  }
  next();
});

// Pre-update hook for updateOne operations
EquipmentSchema.pre('updateOne', function(next) {
  this.set({ updated_at: new Date() });
  next();
});

// Pre-update hook for updateMany operations
EquipmentSchema.pre('updateMany', function(next) {
  this.set({ updated_at: new Date() });
  next();
});

// Pre-update hook for replaceOne operations
EquipmentSchema.pre('replaceOne', function(next) {
  this.set({ updated_at: new Date() });
  next();
});

// Pre-update hook for findOneAndReplace operations
EquipmentSchema.pre('findOneAndReplace', function(next) {
  this.set({ updated_at: new Date() });
  next();
});

// Pre-update hook for findOneAndDelete operations
EquipmentSchema.pre('findOneAndDelete', function(next) {
  this.set({ updated_at: new Date() });
  next();
});

// Pre-update hook for deleteOne operations
EquipmentSchema.pre('deleteOne', function(next) {
  this.set({ updated_at: new Date() });
  next();
});

// Pre-update hook for deleteMany operations
EquipmentSchema.pre('deleteMany', function(next) {
  this.set({ updated_at: new Date() });
  next();
});
