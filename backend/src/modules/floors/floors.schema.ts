import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { IsString, IsOptional, IsNumber, IsMongoId } from 'class-validator';
import type { UserInfo } from 'src/types/user.types';

export type FloorDocument = Floor;

@Schema({ 
  timestamps: true,
  collection: 'floors'
})
export class Floor {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;
  

  @Prop({ required: true, type: String, ref: 'Equipment' })
  @IsString()
  equipment_id: string;

  @Prop({ required: true })
  @IsNumber()
  level: number;

  @Prop({ default: "" })
  @IsString()
  designation: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  door_opening?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  floor_levelling?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  landing_call_button?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  landing_chime?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  landing_indication?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  floor_comment?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  signalisation_comment?: string;

  @Prop({ type: Object })
  created_by?: UserInfo;

  @Prop({ type: Object })
  updated_by?: UserInfo;

  @Prop({ type: Object })
  deleted_by?: UserInfo;

  @Prop({ type: Date })
  created_at?: Date;

  @Prop({ type: Date })
  updated_at?: Date;

  @Prop({ type: Date })
  deleted_at?: Date;
}

export const FloorSchema = SchemaFactory.createForClass(Floor);

// Indexes for better query performance
FloorSchema.index({ equipment_id: 1 });
FloorSchema.index({ level: 1 });
FloorSchema.index({ designation: 1 });
FloorSchema.index({ created_at: 1 });
FloorSchema.index({ updated_at: 1 });
FloorSchema.index({ deleted_at: 1 });
