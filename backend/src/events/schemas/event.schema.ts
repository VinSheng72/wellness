import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EventItem', required: true })
  eventItemId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vendor', required: true })
  vendorId: Types.ObjectId;

  @Prop({
    type: [Date],
    required: true,
    validate: {
      validator: function (val: Date[]) {
        return val.length === 3;
      },
      message: 'Must have exactly 3 proposed dates',
    },
  })
  proposedDates: Date[];

  @Prop({
    type: {
      postalCode: { type: String, required: true },
      streetName: { type: String, required: true },
    },
    required: true,
    _id: false,
  })
  location: {
    postalCode: string;
    streetName: string;
  };

  @Prop({
    required: true,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  })
  status: string;

  @Prop({ type: Date })
  confirmedDate?: Date;

  @Prop()
  remarks?: string;

  @Prop({ default: Date.now })
  dateCreated: Date;

  @Prop({ default: Date.now })
  lastModified: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Compound indexes for efficient queries
EventSchema.index({ companyId: 1, dateCreated: -1 });
EventSchema.index({ vendorId: 1, dateCreated: -1 });
