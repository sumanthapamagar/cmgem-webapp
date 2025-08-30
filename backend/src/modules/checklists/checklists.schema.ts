import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { IsString, IsOptional, IsDate, IsEnum, IsArray, IsBoolean, IsMongoId, IsNumber } from 'class-validator';
import type { UserInfo } from 'src/types/user.types';

export type ChecklistDocument = Checklist;

@Schema({ 
  timestamps: false,
  collection: 'checklists'
})
export class Checklist {
  // Remove the manual _id field - Mongoose generates this automatically
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;
  
  // Base fields from checklist class
  @Prop({ required: true })
  @IsString()
  equipment_type: string;

  @Prop({ required: true })
  @IsString()
  title: string;

  @Prop({ default: 1000 })
  @IsOptional()
  @IsNumber()
  order: number;

  @Prop({ required: true })
  @IsString()
  location: string;

  @Prop({ default: "" })
  @IsOptional()
  @IsString()
  category: string;

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

export const ChecklistSchema = SchemaFactory.createForClass(Checklist);

