import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventItemDocument = EventItem & Document;

@Schema({ timestamps: true })
export class EventItem {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Vendor', required: true })
  vendorId: Types.ObjectId;

  @Prop()
  category?: string;

  @Prop()
  price?: number;

  @Prop()
  duration?: number; // in minutes
}

export const EventItemSchema = SchemaFactory.createForClass(EventItem);

// Index on vendorId for efficient queries
EventItemSchema.index({ vendorId: 1 });
