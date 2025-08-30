import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import type { UserInfo } from 'src/types/user.types';

export type AccountDocument = Account;

@Schema({ 
  timestamps: false,
  collection: 'accounts'
})
export class Account {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true, type: Object })
  address: {
    street_1: string;
    street_2?: string;
    city: string;
    post_code: string;
    state: string;
    country: string;
  };

  @Prop()
  phone?: string;

  @Prop()
  fax?: string;

  @Prop()
  website?: string;

  // Auto-generated fields (not required in DTOs)
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

export const AccountSchema = SchemaFactory.createForClass(Account);

// Indexes for better query performance
AccountSchema.index({ name: 1 });
AccountSchema.index({ 'address.city': 1 });
AccountSchema.index({ 'address.state': 1 });
AccountSchema.index({ 'address.country': 1 });
AccountSchema.index({ created_at: 1 });
AccountSchema.index({ updated_at: 1 });
AccountSchema.index({ deleted_at: 1 });
