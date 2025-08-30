import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import type { UserInfo } from 'src/types/user.types';

export type AttachmentDocument = Attachment & Document;

@Schema({ 
  timestamps: false,
  collection: 'attachments',
  strict: true,
  validateBeforeSave: true
})
export class Attachment {
  @Prop({ required: true })
  low_size_url: string;

  @Prop({ required: true })
  low_size_name: string;

  @Prop({ required: true })
  thumb_url: string;

  @Prop({ required: true })
  thumb_name: string;

  @Prop({ required: true })
  large_url: string;

  @Prop({ required: true })
  large_name: string;

  @Prop({ type: String, required: true })
  equipment_id: string;

  @Prop({ type: String, required: false })
  group_id?: string;

  @Prop({ type: String, required: false })
  inspection_item?: string;

  @Prop({ type: String, required: false })
  base64?: string;

  @Prop({ type: Object, required: false })
  created_by?: UserInfo;

  // MongoDB auto-generated fields
  @Prop({ type: Date, default: Date.now })
  created_at: Date;

  @Prop({ type: Date })
  updated_at?: Date;

  @Prop({ type: Date })
  deleted_at?: Date;

  @Prop({ type: Object })
  updated_by?: UserInfo;

  @Prop({ type: Object })
  deleted_by?: UserInfo;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);

// Add indexes
AttachmentSchema.index({ equipment_id: 1 });
AttachmentSchema.index({ created_at: -1 });
AttachmentSchema.index({ group_id: 1 });

// Compound indexes for better performance
AttachmentSchema.index({ equipment_id: 1, deleted_at: 1 });
AttachmentSchema.index({ _id: 1, deleted_at: 1 });
AttachmentSchema.index({ group_id: 1, deleted_at: 1 });

// Pre-save hook to set updated_at
AttachmentSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updated_at = new Date();
  }
  next();
});

// Pre-update hooks
AttachmentSchema.pre('updateOne', function(next) {
  this.set({ updated_at: new Date() });
  next();
});

AttachmentSchema.pre('updateMany', function(next) {
  this.set({ updated_at: new Date() });
  next();
});

AttachmentSchema.pre('replaceOne', function(next) {
  this.set({ updated_at: new Date() });
  next();
});

AttachmentSchema.pre('findOneAndReplace', function(next) {
  this.set({ updated_at: new Date() });
  next();
});

AttachmentSchema.pre('findOneAndDelete', function(next) {
  this.set({ updated_at: new Date() });
  next();
});

AttachmentSchema.pre('deleteOne', function(next) {
  this.set({ updated_at: new Date() });
  next();
});

AttachmentSchema.pre('deleteMany', function(next) {
  this.set({ updated_at: new Date() });
  next();
});
