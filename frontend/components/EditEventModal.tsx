'use client';

import EventForm from '@/components/EventForm';
import { SerializedEvent } from '@/components/EventTable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type EditEventModalProps = {
  event: SerializedEvent;
  onClose: () => void;
  onEventUpdated: () => void;
};

export default function EditEventModal({ event, onClose, onEventUpdated }: EditEventModalProps) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Event</DialogTitle>
        </DialogHeader>
        
        <EventForm 
          mode="edit"
          initialData={{
            _id: event._id,
            eventItemId: event.eventItemId._id,
            proposedDates: event.proposedDates,
            location: event.location,
          }}
          onEventUpdated={onEventUpdated}
        />
      </DialogContent>
    </Dialog>
  );
}
