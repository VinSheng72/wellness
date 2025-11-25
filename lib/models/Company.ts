import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Company document interface
 */
export interface ICompany extends Document {
  name: string;
  createdAt: Date;
}

/**
 * Company schema definition
 */
const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [2, 'Company name must be at least 2 characters long'],
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Company model
 */
const Company: Model<ICompany> = mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);

export default Company;
