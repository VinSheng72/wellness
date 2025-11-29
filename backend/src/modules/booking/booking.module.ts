import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Event Items
import { EventItem, EventItemSchema } from '../event-items/schemas/event-item.schema';
import { EventItemsRepository } from '../event-items/event-items.repository';
import { EventItemsService } from '../event-items/event-items.service';
import { EventItemsController } from '../event-items/event-items.controller';

// Events
import { Event, EventSchema } from '../events/schemas/event.schema';
import { EventsRepository } from '../events/events.repository';
import { EventsService } from '../events/events.service';
import { EventsController } from '../events/events.controller';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventItem.name, schema: EventItemSchema },
      { name: Event.name, schema: EventSchema },
    ]),
  ],
  controllers: [EventItemsController, EventsController],
  providers: [
    EventItemsRepository,
    EventItemsService,
    EventsRepository,
    EventsService,
  ],
  exports: [
    EventItemsRepository,
    EventItemsService,
    EventsRepository,
    EventsService,
  ],
})
export class BookingModule {}
