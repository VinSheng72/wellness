import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { XCircle } from 'lucide-react';

interface RejectFormProps {
  onConfirm: (remarks: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function RejectForm({ onConfirm, onCancel, isSubmitting }: RejectFormProps) {
  const [remarks, setRemarks] = useState('');

  return (
    <div className="mt-4 rounded-md border-2 border-red-300 bg-gradient-to-br from-red-50 to-red-100 p-3">
      <h4 className="mb-2 text-sm font-semibold text-gray-900 flex items-center gap-2">
        <XCircle className="h-4 w-4 text-red-600" />
        Enter Rejection Remarks
      </h4>
      <Textarea
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        placeholder="Please provide a reason for rejection..."
        rows={3}
      />
      <div className="mt-3 flex gap-2">
        <Button
          onClick={() => onConfirm(remarks)}
          disabled={isSubmitting || !remarks.trim()}
          variant="destructive"
          className="flex-1 flex items-center justify-center gap-2"
        >
          <XCircle className="h-4 w-4" />
          {isSubmitting ? 'Rejecting...' : 'Confirm'}
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
