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
}
