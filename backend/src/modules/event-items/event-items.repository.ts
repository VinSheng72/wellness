import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventItem, EventItemDocument } from './schemas/event-item.schema';

@Injectable()
export class EventItemsRepository {
  constructor(
    @InjectModel(EventItem.name)
    private eventItemModel: Model<EventItemDocument>,
  ) {}

  async findAll(): Promise<EventItemDocument[]> {
    return this.eventItemModel.find().exec();
  }

  async findById(
    id: string | Types.ObjectId,
  ): Promise<EventItemDocument | null> {
    return this.eventItemModel.findById(id).exec();
  }

  async create(eventItemData: Partial<EventItem>): Promise<EventItemDocument> {
    const eventItem = new this.eventItemModel(eventItemData);
    return eventItem.save();
  }

  async findByVendor(vendorId: string): Promise<EventItemDocument[]> {
    return this.eventItemModel
      .find({ vendorId: new Types.ObjectId(vendorId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async validateOwnership(
    eventItemId: string,
    vendorId: string,
  ): Promise<boolean> {
    const eventItem = await this.eventItemModel
      .findOne({
        _id: new Types.ObjectId(eventItemId),
        vendorId: new Types.ObjectId(vendorId),
      })
      .exec();
    return eventItem !== null;
  }
}
