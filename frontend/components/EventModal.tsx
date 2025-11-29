'use client';

import { useState } from 'react';
import { Building2, Calendar, MapPin, User, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { SerializedEvent } from '@/components/EventTable';
import { apiClient } from '@/lib/api';
import { UserRole } from '@/lib/enums/user-role.enum';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ErrorMessage } from '@/components/ui/error-message';
import { formatDate } from '@/lib/utils/date';
import { getStatusConfig } from '@/lib/utils/status';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EventStatus } from '@/lib/enums/event-status.enum';

type EventModalProps = {
  event: SerializedEvent;
  userRole: UserRole;
  onClose: () => void;
  onEventUpdate?: () => void;
};

export default function EventModal({ event, userRole, onClose, onEventUpdate }: EventModalProps) {
  const { showToast } = useToast();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    if (!selectedDate) {
      setError('Please select a date to confirm');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await apiClient.approveEvent(event._id, selectedDate);

      showToast('Event approved successfully!', 'success');
      if (onEventUpdate) {
        onEventUpdate();
      }
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to approve event';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      setError('Please enter rejection remarks');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await apiClient.rejectEvent(event._id, remarks.trim());

      showToast('Event rejected successfully', 'success');
      if (onEventUpdate) {
        onEventUpdate();
      }
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to reject event';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = event.status === EventStatus.PENDING;
  const showVendorActions = userRole === UserRole.VENDOR_ADMIN && isPending;

  const statusConfig = getStatusConfig(event.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-2xl font-bold">Event Details</DialogTitle>
            <Badge className={`${statusConfig.className} border`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {event.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {event.companyId?.name ?? 'Unknown Company'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Event Type</label>
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {event.eventItemId?.name ?? 'Unknown Event Type'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="p-2 rounded-lg bg-green-100">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-gray-500 mb-1">Vendor</label>
                <div className="text-sm font-semibold text-gray-900">
                  {event.eventItemId?.vendorId?.name ?? 'Unknown Vendor'}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <label className="text-sm font-semibold text-gray-900">Proposed Dates</label>
              </div>
              <div className="grid gap-2">
                {event.proposedDates.map((date, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-700 bg-white px-3 py-2 rounded-md">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
                    {formatDate(date)}
                  </div>
                ))}
              </div>
            </div>

            {event.confirmedDate && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <label className="text-sm font-semibold text-gray-900">Confirmed Date</label>
                </div>
                <div className="text-base font-bold text-green-700">
                  {formatDate(event.confirmedDate)}
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="p-2 rounded-lg bg-orange-100">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                <div className="text-sm text-gray-900">
                  <div className="font-semibold">{event.location.streetName}</div>
                  <div className="text-gray-600 mt-1">Postal Code: {event.location.postalCode}</div>
                </div>
              </div>
            </div>

            {event.remarks && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <label className="text-sm font-semibold text-gray-900">Rejection Remarks</label>
                </div>
                <div className="text-sm text-red-700 bg-white p-3 rounded-md">
                  {event.remarks}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
              <Clock className="w-4 h-4" />
              <span>Created on {formatDate(event.dateCreated)}</span>
            </div>
          </div>

          {error && <ErrorMessage message={error} className="mt-4" />}

          {showVendorActions && !isApproving && !isRejecting && (
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                onClick={() => setIsApproving(true)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve Event
              </Button>
              <Button 
                onClick={() => setIsRejecting(true)}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Event
              </Button>
            </div>
          )}

          {isApproving && (
            <div className="mt-6 rounded-xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-green-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-green-600">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">Select Confirmed Date</h4>
              </div>
              <div className="space-y-2 mb-4">
                {event.proposedDates.map((date, index) => (
                  <label 
                    key={index} 
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedDate === date 
                        ? 'bg-green-600 text-white shadow-md' 
                        : 'bg-white hover:bg-green-50 border border-green-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="confirmedDate"
                      value={date}
                      checked={selectedDate === date}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">{formatDate(date)}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => {
                    setIsApproving(false);
                    setSelectedDate('');
                    setError('');
                  }}
                  disabled={isSubmitting}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isSubmitting || !selectedDate}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Approving...' : 'Confirm Approval'}
                </Button>
              </div>
            </div>
          )}

          {isRejecting && (
            <div className="mt-6 rounded-xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-red-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-red-600">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">Enter Rejection Remarks</h4>
              </div>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Please provide a detailed reason for rejection..."
                rows={4}
                className="bg-white"
              />
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  onClick={() => {
                    setIsRejecting(false);
                    setRemarks('');
                    setError('');
                  }}
                  disabled={isSubmitting}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isSubmitting || !remarks.trim()}
                  variant="destructive"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {!isApproving && !isRejecting && (
          <DialogFooter>
            <Button 
              onClick={onClose} 
              disabled={isSubmitting}
              variant="outline"
            >
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
