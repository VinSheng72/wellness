import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Vendor document interface
 */
export interface IVendor extends Document {
  name: string;
  contactEmail: string;
  createdAt: Date;
}

/**
 * Vendor schema definition
 */
const VendorSchema = new Schema<IVendor>(
  {
    name: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true,
      minlength: [2, 'Vendor name must be at least 2 characters long'],
      maxlength: [100, 'Vendor name cannot exceed 100 characters'],
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Vendor model
 */
const Vendor: Model<IVendor> = mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema);

export default Vendor;
