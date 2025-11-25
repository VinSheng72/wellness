import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Event status enumeration
 */
export enum EventStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

/**
 * Location interface
 */
export interface ILocation {
  postalCode: string;
  streetName: string;
}

/**
 * Event document interface
 */
export interface IEvent extends Document {
  companyId: mongoose.Types.ObjectId;
  eventItemId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  proposedDates: Date[];
  location: ILocation;
  status: EventStatus;
  confirmedDate?: Date;
  remarks?: string;
  dateCreated: Date;
  lastModified: Date;
}

/**
 * Location schema
 */
const LocationSchema = new Schema<ILocation>(
  {
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
    },
    streetName: {
      type: String,
      required: [true, 'Street name is required'],
      trim: true,
    },
  },
  { _id: false }
);

/**
 * Event schema definition
 */
const EventSchema = new Schema<IEvent>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
    },
    eventItemId: {
      type: Schema.Types.ObjectId,
      ref: 'EventItem',
      required: [true, 'Event item ID is required'],
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Vendor ID is required'],
    },
    proposedDates: {
      type: [Date],
      required: [true, 'Proposed dates are required'],
      validate: {
        validator: function (dates: Date[]) {
          return dates && dates.length === 3;
        },
        message: 'Exactly 3 proposed dates are required',
      },
    },
    location: {
      type: LocationSchema,
      required: [true, 'Location is required'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: Object.values(EventStatus),
        message: '{VALUE} is not a valid status',
      },
      default: EventStatus.PENDING,
    },
    confirmedDate: {
      type: Date,
      required: false,
    },
    remarks: {
      type: String,
      trim: true,
      required: false,
    },
    dateCreated: {
      type: Date,
      default: Date.now,
      required: [true, 'Date created is required'],
    },
    lastModified: {
      type: Date,
      default: Date.now,
      required: [true, 'Last modified date is required'],
    },
  },
  {
    timestamps: false, // We're managing dateCreated and lastModified manually
  }
);

/**
 * Pre-save hook to update lastModified timestamp
 */
EventSchema.pre('save', function () {
  this.lastModified = new Date();
});

/**
 * Compound index on companyId and dateCreated for HR Admin queries
 */
EventSchema.index({ companyId: 1, dateCreated: -1 });

/**
 * Compound index on vendorId and dateCreated for Vendor Admin queries
 */
EventSchema.index({ vendorId: 1, dateCreated: -1 });

/**
 * Event model
 */
const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
