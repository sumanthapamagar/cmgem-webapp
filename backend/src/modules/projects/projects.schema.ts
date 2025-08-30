import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { IsString, IsOptional, IsDate, IsEnum, IsArray, IsNumber, IsMongoId } from 'class-validator';
import type { UserInfo } from 'src/types/user.types';

export type ProjectDocument = Project;

@Schema({ 
  timestamps: false,
  collection: 'projects'
})
export class Project {
  @Prop({ required: true })
  @IsString()
  name: string;

  @Prop({ required: true })
  @IsString()
  category: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Account' })
  @IsMongoId()
  account_id: Types.ObjectId;

  @Prop({ required: true, type: Object })
  address: {
    street_1: string;
    street_2?: string;
    city: string;
    post_code: string;
    state: string;
    country: string;
  };

  @Prop({ required: true, type: Date })
  @IsDate()
  inspection_date: Date;

  @Prop({ default: false })
  @IsOptional()
  is_test: boolean;

  // Auto-generated fields (not required in DTOs)
  @Prop({ type: Object })
  created_by?: UserInfo;

  // Auto-generated fields (not required in DTOs)
  @Prop({ type: Object })
  updated_by?: UserInfo;

  // Auto-generated fields (not required in DTOs)
  @Prop({ type: Object })
  deleted_by?: UserInfo;

  @Prop({ type: Date })
  created_at?: Date;

  @Prop({ type: Date })
  updated_at?: Date;

  @Prop({ type: Date })
  deleted_at?: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Indexes for better query performance
ProjectSchema.index({ account_id: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ 'address.city': 1 });
ProjectSchema.index({ 'address.state': 1 });
ProjectSchema.index({ 'address.country': 1 });
ProjectSchema.index({ inspection_date: 1 });
ProjectSchema.index({ created_at: 1 });
ProjectSchema.index({ updated_at: 1 });
ProjectSchema.index({ deleted_at: 1 });

// Compound indexes for better performance
ProjectSchema.index({ _id: 1, deleted_at: 1 });
ProjectSchema.index({ account_id: 1, deleted_at: 1 });
ProjectSchema.index({ category: 1, deleted_at: 1 });
ProjectSchema.index({ created_at: -1, deleted_at: 1 });
ProjectSchema.index({ name: 1, deleted_at: 1 });