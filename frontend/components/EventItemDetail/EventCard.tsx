import { EventResponse } from '@/lib/api/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { getStatusConfig } from '@/lib/utils/status';
import { EventStatus } from '@/lib/enums/event-status.enum';

interface EventCardProps {
  event: EventResponse;
  onApprove: (event: EventResponse) => void;
  onReject: (event: EventResponse) => void;
}

export function EventCard({ event, onApprove, onReject }: EventCardProps) {
  const statusConfig = getStatusConfig(event.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="border  rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start mb-3">
        <Badge className={`${statusConfig.className} border flex items-center gap-1`}>
          <StatusIcon className="h-3 w-3" />
          {event.status}
        </Badge>
        <div className="text-xs text-gray-500">
          Created: {formatDate(event.dateCreated)}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-gray-700">Company:</span>
          <span className="ml-2 text-gray-600">
            {event.companyId?.name ?? 'Unknown Company'}
          </span>
        </div>

        <div>
          <span className="font-medium text-gray-700">Proposed Dates:</span>
          <ul className="ml-4 mt-1 list-disc text-gray-600">
            {event.proposedDates.map((date, idx) => (
              <li key={idx}>{formatDate(date)}</li>
            ))}
          </ul>
        </div>

        {event.confirmedDate && (
          <div>
            <span className="font-medium text-gray-700">Confirmed Date:</span>
            <span className="ml-2 text-green-700 font-semibold">
              {formatDate(event.confirmedDate)}
            </span>
          </div>
        )}

        <div>
          <span className="font-medium text-gray-700">Location:</span>
          <span className="ml-2 text-gray-600">
            {event.location.streetName}, {event.location.postalCode}
          </span>
        </div>

        {event.remarks && (
          <div>
            <span className="font-medium text-gray-700">Remarks:</span>
            <p className="mt-1 text-gray-600">{event.remarks}</p>
          </div>
        )}
      </div>

      {event.status === EventStatus.PENDING && (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => onApprove(event)}
            className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve
          </Button>
          <Button
            onClick={() => onReject(event)}
            variant="destructive"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}
