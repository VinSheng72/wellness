'use client';

import { SerializedEvent } from './EventTable';

type EventModalProps = {
  event: SerializedEvent;
  userRole: 'HR_ADMIN' | 'VENDOR_ADMIN';
  onClose: () => void;
};

/**
 * EventModal Component
 * Displays all event information in a modal popup
 * For HR role: Shows all information without action buttons
 * Requirements: 3.5
 */
export default function EventModal({ event, userRole, onClose }: EventModalProps) {
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

          {/* Footer - No action buttons for HR role */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
