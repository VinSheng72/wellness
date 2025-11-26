import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventModal from '../EventModal';
import { SerializedEvent } from '../EventTable';
import { ToastProvider } from '@/app/components/Toast';

// Mock fetch
global.fetch = jest.fn();

describe('EventModal - Vendor Actions', () => {
  const mockOnClose = jest.fn();
  const mockOnEventUpdate = jest.fn();

  const mockPendingEvent: SerializedEvent = {
    _id: '123',
    companyId: { _id: 'company1', name: 'Test Company' },
    eventItemId: { _id: 'item1', name: 'Health Talk' },
    vendorId: { _id: 'vendor1', name: 'Test Vendor' },
    proposedDates: [
      '2024-01-15T00:00:00.000Z',
      '2024-01-16T00:00:00.000Z',
      '2024-01-17T00:00:00.000Z',
    ],
    location: {
      postalCode: '123456',
      streetName: 'Test Street',
    },
    status: 'Pending',
    confirmedDate: null,
    remarks: null,
    dateCreated: '2024-01-01T00:00:00.000Z',
  };

  const mockApprovedEvent: SerializedEvent = {
    ...mockPendingEvent,
    status: 'Approved',
    confirmedDate: '2024-01-15T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('button visibility based on event status', () => {
    it('should show Approve and Reject buttons for Vendor Admin on Pending events', () => {
      render(
        <ToastProvider>
          <EventModal
            event={mockPendingEvent}
            userRole="VENDOR_ADMIN"
            onClose={mockOnClose}
            onEventUpdate={mockOnEventUpdate}
          />
        </ToastProvider>
      );

      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
    });

    it('should not show Approve and Reject buttons for HR Admin', () => {
      render(
        <ToastProvider>
          <EventModal
            event={mockPendingEvent}
            userRole="HR_ADMIN"
            onClose={mockOnClose}
            onEventUpdate={mockOnEventUpdate}
          />
        </ToastProvider>
      );

      expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /reject/i })).not.toBeInTheDocument();
    });

    it('should not show Approve and Reject buttons for Approved events', () => {
      render(
        <ToastProvider>
          <EventModal
            event={mockApprovedEvent}
            userRole="VENDOR_ADMIN"
            onClose={mockOnClose}
            onEventUpdate={mockOnEventUpdate}
          />
        </ToastProvider>
      );

      expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /reject/i })).not.toBeInTheDocument();
    });
  });

  describe('approve button click and date selection', () => {
    it('should show date selection form when Approve button is clicked', () => {
      render(
        <ToastProvider>
          <EventModal
            event={mockPendingEvent}
            userRole="VENDOR_ADMIN"
            onClose={mockOnClose}
            onEventUpdate={mockOnEventUpdate}
          />
        </ToastProvider>
      );

      const approveButton = screen.getByRole('button', { name: /^approve$/i });
      fireEvent.click(approveButton);

      expect(screen.getByText('Select Confirmed Date')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm approval/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should display all three proposed dates as radio options', () => {
      render(
        <ToastProvider>
          <EventModal
            event={mockPendingEvent}
            userRole="VENDOR_ADMIN"
            onClose={mockOnClose}
            onEventUpdate={mockOnEventUpdate}
          />
        </ToastProvider>
      );

      const approveButton = screen.getByRole('button', { name: /^approve$/i });
      fireEvent.click(approveButton);

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(3);
    });

    it('should allow selecting a date', () => {
      render(
        <ToastProvider>
          <EventModal
            event={mockPendingEvent}
            userRole="VENDOR_ADMIN"
            onClose={mockOnClose}
            onEventUpdate={mockOnEventUpdate}
          />
        </ToastProvider>
      );

      const approveButton = screen.getByRole('button', { name: /^approve$/i });
      fireEvent.click(approveButton);

      const radioButtons = screen.getAllByRole('radio');
      fireEvent.click(radioButtons[0]);

      expect(radioButtons[0]).toBeChecked();
    });

    it('should call approve API with selected date when confirmed', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <ToastProvider>
          <EventModal
            event={mockPendingEvent}
            userRole="VENDOR_ADMIN"
            onClose={mockOnClose}
            onEventUpdate={mockOnEventUpdate}
          />
        </ToastProvider>
      );

      const approveButton = screen.getByRole('button', { name: /^approve$/i });
      fireEvent.click(approveButton);

      const radioButtons = screen.getAllByRole('radio');
      fireEvent.click(radioButtons[0]);

      const confirmButton = screen.getByRole('button', { name: /confirm approval/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/events/123/approve', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ confirmedDate: mockPendingEvent.proposedDates[0] }),
        });
      });
    });

    it('should disable confirm button if no date is selected', () => {
      render(
        <ToastProvider>
          <EventModal
            event={mockPendingEvent}
            userRole="VENDOR_ADMIN"
            onClose={mockOnClose}
            onEventUpdate={mockOnEventUpdate}
          />
        </ToastProvider>
      );

      const approveButton = screen.getByRole('button', { name: /^approve$/i });
      fireEvent.click(approveButton);

      const confirmButton = screen.getByRole('button', { name: /confirm approval/i });
      expect(confirmButton).toBeDisabled();
    });

    it('should close modal and call onEventUpdate after successful approval', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <ToastProvider>
          <EventModal
            event={mockPendingEvent}
            userRole="VENDOR_ADMIN"
            onClose={mockOnClose}
            onEventUpdate={mockOnEventUpdate}
          />
        </ToastProvider>
      );

      const approveButton = screen.getByRole('button', { name: /^approve$/i });
      fireEvent.click(approveButton);

      const radioButtons = screen.getAllByRole('radio');
      fireEvent.click(radioButtons[0]);

      const confirmButton = screen.getByRole('button', { name: /confirm approval/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnEventUpdate).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should cancel approval and hide date selection form', () => {
      render(
        <ToastProvider>
          <EventModal
            event={mockPendingEvent}
            userRole="VENDOR_ADMIN"
            onClose={mockOnClose}
            onEventUpdate={mockOnEventUpdate}
          />
        </ToastProvider>
      );

      const approveButton = screen.getByRole('button', { name: /^approve$/i });
      fireEvent.click(approveButton);

      expect(screen.getByText('Select Confirmed Date')).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(screen.queryByText('Select Confirmed Date')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^approve$/i })).toBeInTheDocument();
    });
  });

  describe('reject button click and remarks input', () => {
    it('should show remarks input form when Reject button is clicked', () => {
      render(
        <ToastProvider>
          <EventModal
            event={mockPendingEvent}
            userRole="VENDOR_ADMIN"
            onClose={mockOnClose}
            onEventUpdate={mockOnEventUpdate}
          />
        </ToastProvider>
      );

      const rejectButton = screen.getByRole('button', { name: /^reject$/i });
      fireEvent.click(rejectButton);

      expect(screen.getByText('Enter Rejection Remarks')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/please provide a reason/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm rejection/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should allow entering remarks', () => {
      render(
        <ToastProvider>
          <EventModal
            event={mockPendingEvent}
            userRole="VENDOR_ADMIN"
            onClose={mockOnClose}
            onEventUpdate={mockOnEventUpdate}
          />
        </ToastProvider>
      );

      const rejectButton = screen.getByRole('button', { name: /^reject$/i });
      fireEvent.click(rejectButton);

      const textarea = screen.getByPlaceholderText(/please provide a reason/i);
      fireEvent.change(textarea, { target: { value: 'Not available on these dates' } });

      expect(textarea).toHaveValue('Not available on these dates');
    });

    it('should call reject API with remarks when confirmed', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <ToastProvider>
          <EventModal
            event={mockPendingEvent}
            userRole="VENDOR_ADMIN"
            onClose={mockOnClose}
            onEventUpdate={mockOnEventUpdate}
          />
        </ToastProvider>
      );

      const rejectButton = screen.getByRole('button', { name: /^reject$/i });
      fireEvent.click(rejectButton);

      const textarea = screen.getByPlaceholderText(/please provide a reason/i);
      fireEvent.change(textarea, { target: { value: 'Not available on these dates' } });

      const confirmButton = screen.getByRole('button', { name: /confirm rejection/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/events/123/reject', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ remarks: 'Not available on these dates' }),
        });
      });
    });

    it('should disable confirm button if remarks are empty', () => {
      render(
        <ToastProvider>
          <EventModal
            event={mockPendingEvent}
            userRole="VENDOR_ADMIN"
            onClose={mockOnClose}
            onEventUpdate={mockOnEventUpdate}
          />
        </ToastProvider>
      );

      const rejectButton = screen.getByRole('button', { name: /^reject$/i });
      fireEvent.click(rejectButton);

      const confirmButton = screen.getByRole('button', { name: /confirm rejection/i });
      expect(confirmButton).toBeDisabled();
    });

    it('should close modal and call onEventUpdate after successful rejection', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <ToastProvider>
          <EventModal
            event={mockPendingEvent}
            userRole="VENDOR_ADMIN"
            onClose={mockOnClose}
            onEventUpdate={mockOnEventUpdate}
          />
        </ToastProvider>
      );

      const rejectButton = screen.getByRole('button', { name: /^reject$/i });
      fireEvent.click(rejectButton);

      const textarea = screen.getByPlaceholderText(/please provide a reason/i);
      fireEvent.change(textarea, { target: { value: 'Not available' } });

      const confirmButton = screen.getByRole('button', { name: /confirm rejection/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnEventUpdate).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should cancel rejection and hide remarks form', () => {
      render(
        <ToastProvider>
          <EventModal
            event={mockPendingEvent}
            userRole="VENDOR_ADMIN"
            onClose={mockOnClose}
            onEventUpdate={mockOnEventUpdate}
          />
        </ToastProvider>
      );

      const rejectButton = screen.getByRole('button', { name: /^reject$/i });
      fireEvent.click(rejectButton);

      expect(screen.getByText('Enter Rejection Remarks')).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(screen.queryByText('Enter Rejection Remarks')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^reject$/i })).toBeInTheDocument();
    });
  });
});
