'use client';

import { useState } from 'react';
import EventModal from '@/components/EventModal';
import { UserRole } from '@/lib/enums/user-role.enum';
import { formatDate } from '@/lib/utils/date';
import { getStatusVariant } from '@/lib/utils/status';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EventStatus } from '@/lib/enums/event-status.enum';

export type SerializedEvent = {
  _id: string;
  companyId: { _id: string; name: string };
  eventItemId: { 
    _id: string; 
    name: string;
    description?: string;
    vendorId: { _id: string; name: string };
  };
  vendorId: string;
  proposedDates: string[];
  location: {
    postalCode: string;
    streetName: string;
  };
  status: 'Pending' | 'Approved' | 'Rejected';
  confirmedDate: string | null;
  remarks: string | null;
  dateCreated: string;
};

type EventTableProps = {
  events: SerializedEvent[];
  userRole: UserRole;
  onEventUpdate?: () => void;
  onEditEvent?: (event: SerializedEvent) => void;
};

export default function EventTable({ events, userRole, onEventUpdate, onEditEvent }: EventTableProps) {
  const [selectedEvent, setSelectedEvent] = useState<SerializedEvent | null>(null);

  const formatDates = (event: SerializedEvent) => {
    if (event.confirmedDate) {
      return formatDate(event.confirmedDate, 'short');
    }
    return event.proposedDates.map((date) => formatDate(date, 'short')).join(', ');
  };

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">No events found. Create your first event above.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Name</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Date(s)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event._id}>
                <TableCell>
                  <div className="font-medium max-w-[200px] truncate" title={event.eventItemId.name}>
                    {event.eventItemId.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[150px] truncate" title={event.eventItemId.vendorId.name}>
                    {event.eventItemId.vendorId.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[180px]">
                    {formatDates(event)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(event.status)}>
                    {event.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(event.dateCreated, 'short')}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEvent(event)}
                    >
                      View
                    </Button>
                    {userRole === UserRole.HR_ADMIN && onEditEvent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => event.status === EventStatus.PENDING && onEditEvent(event)}
                        disabled={event.status !== EventStatus.PENDING}
                        title={
                          event.status === EventStatus.APPROVED
                            ? 'Cannot edit approved events'
                            : event.status === EventStatus.REJECTED
                            ? 'Cannot edit rejected events'
                            : 'Edit event'
                        }
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          userRole={userRole}
          onClose={() => setSelectedEvent(null)}
          onEventUpdate={() => {
            setSelectedEvent(null);
            if (onEventUpdate) {
              onEventUpdate();
            }
          }}
        />
      )}
    </>
  );
}
