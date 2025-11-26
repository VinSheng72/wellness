import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventItem, EventItemSchema } from './schemas/event-item.schema';
import { EventItemsRepository } from './event-items.repository';
import { EventItemsService } from './event-items.service';
import { EventItemsController } from './event-items.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventItem.name, schema: EventItemSchema },
    ]),
  ],
  controllers: [EventItemsController],
  providers: [EventItemsRepository, EventItemsService],
  exports: [EventItemsRepository, EventItemsService],
})
export class EventItemsModule {}
