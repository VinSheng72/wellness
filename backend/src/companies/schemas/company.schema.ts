import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyDocument = Company & Document;

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true })
  name: string;

  @Prop()
  address?: string;

  @Prop()
  contactEmail?: string;

  @Prop()
  contactPhone?: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
