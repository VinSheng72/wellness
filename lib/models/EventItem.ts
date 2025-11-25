import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * EventItem document interface
 */
export interface IEventItem extends Document {
  name: string;
  vendorId: mongoose.Types.ObjectId;
  description?: string;
  createdAt: Date;
}

/**
 * EventItem schema definition
 */
const EventItemSchema = new Schema<IEventItem>(
  {
    name: {
      type: String,
      required: [true, 'Event item name is required'],
      trim: true,
      minlength: [2, 'Event item name must be at least 2 characters long'],
      maxlength: [100, 'Event item name cannot exceed 100 characters'],
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Vendor ID is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Index on vendorId for query performance
 */
EventItemSchema.index({ vendorId: 1 });

/**
 * EventItem model
 */
const EventItem: Model<IEventItem> = mongoose.models.EventItem || mongoose.model<IEventItem>('EventItem', EventItemSchema);

export default EventItem;
