'use client';

import { useState } from 'react';
import { SerializedEvent } from './EventTable';

type EventModalProps = {
  event: SerializedEvent;
  userRole: 'HR_ADMIN' | 'VENDOR_ADMIN';
  onClose: () => void;
  onEventUpdate?: () => void;
};

/**
 * EventModal Component
 * Displays all event information in a modal popup
 * For HR role: Shows all information without action buttons
 * For Vendor role: Shows Approve/Reject buttons for Pending events
 * Requirements: 3.5, 4.5, 5.1, 5.2, 5.3, 6.1, 6.2
 */
export default function EventModal({ event, userRole, onClose, onEventUpdate }: EventModalProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async () => {
    if (!selectedDate) {
      setError('Please select a date to confirm');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/events/${event._id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmedDate: selectedDate }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to approve event');
      }

      // Success - refresh the page or notify parent
      if (onEventUpdate) {
        onEventUpdate();
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve event');
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
      const response = await fetch(`/api/events/${event._id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remarks: remarks.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to reject event');
      }

      // Success - refresh the page or notify parent
      if (onEventUpdate) {
        onEventUpdate();
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = event.status === 'Pending';
  const showVendorActions = userRole === 'VENDOR_ADMIN' && isPending;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Event Details
              </h2>
              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(
                  event.status
                )}`}
              >
                {event.status}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Event Information */}
          <div className="space-y-4">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {event.companyId.name}
              </p>
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Event Type
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {event.eventItemId.name}
              </p>
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Vendor
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {event.vendorId.name}
              </p>
            </div>

            {/* Proposed Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Proposed Dates
              </label>
              <ul className="mt-1 list-inside list-disc text-sm text-gray-900">
                {event.proposedDates.map((date, index) => (
                  <li key={index}>{formatDate(date)}</li>
                ))}
              </ul>
            </div>

            {/* Confirmed Date (if approved) */}
            {event.confirmedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirmed Date
                </label>
                <p className="mt-1 text-sm font-semibold text-green-700">
                  {formatDate(event.confirmedDate)}
                </p>
              </div>
            )}

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {event.location.streetName}
                <br />
                Postal Code: {event.location.postalCode}
              </p>
            </div>

            {/* Remarks (if rejected) */}
            {event.remarks && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rejection Remarks
                </label>
                <p className="mt-1 text-sm text-red-700">
                  {event.remarks}
                </p>
              </div>
            )}

            {/* Date Created */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date Created
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(event.dateCreated)}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Vendor Actions - Only for Vendor Admin on Pending events */}
          {showVendorActions && !isApproving && !isRejecting && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsApproving(true)}
                className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Approve
              </button>
              <button
                onClick={() => setIsRejecting(true)}
                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Reject
              </button>
            </div>
          )}

          {/* Approve Form */}
          {isApproving && (
            <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Select Confirmed Date
              </h3>
              <div className="space-y-2">
                {event.proposedDates.map((date, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="confirmedDate"
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
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting || !selectedDate}
                  className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Approving...' : 'Confirm Approval'}
                </button>
                <button
                  onClick={() => {
                    setIsApproving(false);
                    setSelectedDate('');
                    setError('');
                  }}
                  disabled={isSubmitting}
                  className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Reject Form */}
          {isRejecting && (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Enter Rejection Remarks
              </h3>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={isSubmitting || !remarks.trim()}
                  className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
                <button
                  onClick={() => {
                    setIsRejecting(false);
                    setRemarks('');
                    setError('');
                  }}
                  disabled={isSubmitting}
                  className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
