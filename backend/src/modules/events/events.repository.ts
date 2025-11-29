import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { EventStatus } from '../../common/enums/event-status.enum';

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


  async findByCompany(
    companyId: string | Types.ObjectId,
  ): Promise<EventDocument[]> {
    const objectId =
      typeof companyId === 'string' ? new Types.ObjectId(companyId) : companyId;
    return this.eventModel
      .find({ companyId: objectId })
      .sort({ dateCreated: -1 })
      .populate('eventItemId', 'name description')
      .populate('companyId', 'name')
      .populate({
        path: 'eventItemId',
        populate: {
          path: 'vendorId',
          select: 'name',
        },
      })
      .exec();
  }

  async findByVendor(
    vendorId: string | Types.ObjectId,
  ): Promise<EventDocument[]> {
    const objectId =
      typeof vendorId === 'string' ? new Types.ObjectId(vendorId) : vendorId;
    return this.eventModel
      .find({ vendorId: objectId })
      .sort({ dateCreated: -1 })
      .populate('eventItemId', 'name description')
      .populate('companyId', 'name')
      .populate({
        path: 'eventItemId',
        populate: {
          path: 'vendorId',
          select: 'name',
        },
      })
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
      .populate('eventItemId', 'name description')
      .populate('companyId', 'name')
      .populate({
        path: 'eventItemId',
        populate: {
          path: 'vendorId',
          select: 'name',
        },
      })
      .exec();
  }

  async findByEventItem(
    eventItemId: string | Types.ObjectId,
  ): Promise<EventDocument[]> {
    const objectId =
      typeof eventItemId === 'string'
        ? new Types.ObjectId(eventItemId)
        : eventItemId;
    return this.eventModel
      .find({ eventItemId: objectId })
      .sort({ dateCreated: -1 })
      .populate('eventItemId', 'name description')
      .populate('companyId', 'name')
      .populate({
        path: 'eventItemId',
        populate: {
          path: 'vendorId',
          select: 'name',
        },
      })
      .exec();
  }

  async findPendingByEventItem(
    eventItemId: string | Types.ObjectId,
  ): Promise<EventDocument[]> {
    const objectId =
      typeof eventItemId === 'string'
        ? new Types.ObjectId(eventItemId)
        : eventItemId;
    return this.eventModel
      .find({ eventItemId: objectId, status: EventStatus.PENDING })
      .populate('eventItemId', 'name description')
      .populate('companyId', 'name')
      .populate({
        path: 'eventItemId',
        populate: {
          path: 'vendorId',
          select: 'name',
        },
      })
      .exec();
  }

  async hasApprovedEventForItem(
    eventItemId: string | Types.ObjectId,
  ): Promise<boolean> {
    const objectId =
      typeof eventItemId === 'string'
        ? new Types.ObjectId(eventItemId)
        : eventItemId;
    const count = await this.eventModel
      .countDocuments({ eventItemId: objectId, status: EventStatus.APPROVED })
      .exec();
    return count > 0;
  }

  async bulkUpdateStatus(
    ids: string[] | Types.ObjectId[],
    status: string,
    remarks: string,
  ): Promise<number> {
    const objectIds = ids.map((id) =>
      typeof id === 'string' ? new Types.ObjectId(id) : id,
    );
    const result = await this.eventModel
      .updateMany(
        { _id: { $in: objectIds } },
        { status, remarks, lastModified: new Date() },
      )
      .exec();
    return result.modifiedCount;
  }
}
