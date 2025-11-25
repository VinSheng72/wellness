import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * User role enumeration
 */
export enum UserRole {
  HR_ADMIN = 'HR_ADMIN',
  VENDOR_ADMIN = 'VENDOR_ADMIN',
}

/**
 * User document interface
 */
export interface IUser extends Document {
  username: string;
  password: string;
  role: UserRole;
  companyId?: mongoose.Types.ObjectId;
  vendorId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

/**
 * User schema definition
 */
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [50, 'Username cannot exceed 50 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: Object.values(UserRole),
        message: '{VALUE} is not a valid role',
      },
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: function (this: IUser) {
        return this.role === UserRole.HR_ADMIN;
      },
      validate: {
        validator: function (this: IUser, value: mongoose.Types.ObjectId) {
          // HR_ADMIN must have companyId, VENDOR_ADMIN must not
          if (this.role === UserRole.HR_ADMIN) {
            return value != null;
          }
          return value == null;
        },
        message: 'HR_ADMIN must have companyId, VENDOR_ADMIN must not have companyId',
      },
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: function (this: IUser) {
        return this.role === UserRole.VENDOR_ADMIN;
      },
      validate: {
        validator: function (this: IUser, value: mongoose.Types.ObjectId) {
          // VENDOR_ADMIN must have vendorId, HR_ADMIN must not
          if (this.role === UserRole.VENDOR_ADMIN) {
            return value != null;
          }
          return value == null;
        },
        message: 'VENDOR_ADMIN must have vendorId, HR_ADMIN must not have vendorId',
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook to hash password before saving to database
 * Only hashes if password is modified or new
 */
UserSchema.pre('save', async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }

  // Generate salt and hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(this.password, saltRounds);
  this.password = hashedPassword;
});

/**
 * Create unique index on username
 */
UserSchema.index({ username: 1 }, { unique: true });

/**
 * User model
 */
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
