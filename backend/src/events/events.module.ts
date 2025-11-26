import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schemas/event.schema';
import { EventsRepository } from './events.repository';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventItemsModule } from '../event-items/event-items.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    EventItemsModule,
    UsersModule,
  ],
  controllers: [EventsController],
  providers: [EventsRepository, EventsService],
  exports: [EventsService, EventsRepository],
})
export class EventsModule {}
