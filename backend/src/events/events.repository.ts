import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';

@Injectable()
export class EventsRepository {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async create(eventData: Partial<Event>): Promise<EventDocument> {
    const event = new this.eventModel(eventData);
    return event.save();
  }

  async findById(id: string | Types.ObjectId): Promise<EventDocument | null> {
    return this.eventModel.findById(id).exec();
  }

  async findByCompany(companyId: string | Types.ObjectId): Promise<EventDocument[]> {
    const objectId = typeof companyId === 'string' ? new Types.ObjectId(companyId) : companyId;
    return this.eventModel
      .find({ companyId: objectId })
      .sort({ dateCreated: -1 })
      .exec();
  }

  async findByVendor(vendorId: string | Types.ObjectId): Promise<EventDocument[]> {
    const objectId = typeof vendorId === 'string' ? new Types.ObjectId(vendorId) : vendorId;
    return this.eventModel
      .find({ vendorId: objectId })
      .sort({ dateCreated: -1 })
      .exec();
  }

  async update(
    id: string | Types.ObjectId,
    updateData: Partial<Event>,
  ): Promise<EventDocument | null> {
    return this.eventModel
      .findByIdAndUpdate(
        id,
        { ...updateData, lastModified: new Date() },
        { new: true },
      )
      .exec();
  }
}
