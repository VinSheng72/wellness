import { EventResponse } from '@/lib/api/types';
import { SerializedEvent } from '@/components/EventTable';

export const serializeEvent = (event: EventResponse): SerializedEvent => ({
  _id: event._id,
  companyId: event.companyId,
  eventItemId: event.eventItemId,
  vendorId: event.vendorId,
  proposedDates: event.proposedDates,
  location: event.location,
  status: event.status,
  confirmedDate: event.confirmedDate || null,
  remarks: event.remarks || null,
  dateCreated: event.dateCreated,
});

export const serializeEvents = (events: EventResponse[]): SerializedEvent[] => 
  events.map(serializeEvent);
