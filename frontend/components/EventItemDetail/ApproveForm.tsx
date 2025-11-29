import { useState } from 'react';
import { EventResponse } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

interface ApproveFormProps {
  event: EventResponse;
  onConfirm: (date: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ApproveForm({ event, onConfirm, onCancel, isSubmitting }: ApproveFormProps) {
  const [selectedDate, setSelectedDate] = useState('');

  return (
    <div className="mt-4 rounded-md border-2 border-green-300 bg-gradient-to-br from-green-50 to-green-100 p-3">
      <h4 className="mb-2 text-sm font-semibold text-gray-900 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        Select Confirmed Date
      </h4>
      <div className="space-y-2">
        {event.proposedDates.map((date, index) => (
          <label
            key={index}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="radio"
              name={`confirmedDate-${event._id}`}
              value={date}
              checked={selectedDate === date}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-4 w-4 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-900">
              {formatDate(date)}
            </span>
          </label>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          onClick={() => onConfirm(selectedDate)}
          disabled={isSubmitting || !selectedDate}
          className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          {isSubmitting ? 'Approving...' : 'Confirm'}
        </Button>
        <Button
          onClick={onCancel}
          disabled={isSubmitting}
          variant="secondary"
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
