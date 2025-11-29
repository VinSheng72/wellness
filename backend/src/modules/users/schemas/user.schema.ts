import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../../common/enums/user-role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, required: true, enum: Object.values(UserRole) })
  role: UserRole;

  @Prop({ type: Types.ObjectId, ref: 'Company' })
  companyId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vendor' })
  vendorId?: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  const user = this as UserDocument;

  if (!user.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});
