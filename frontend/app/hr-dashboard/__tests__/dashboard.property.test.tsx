/**
 * Property-based tests for HR Dashboard rendering
 * Feature: wellness-event-booking
 * Properties: 3, 10, 11
 * Validates: Requirements 2.1, 3.2, 3.5, 4.2, 4.5
 */

import fc from 'fast-check';
import { render, screen, within, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventTable, { SerializedEvent } from '../components/EventTable';
import EventForm from '../components/EventForm';
import { ToastProvider } from '@/app/components/Toast';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Generators for property-based testing

/**
 * Generate a valid company name (non-whitespace)
 */
const companyNameArbitrary = fc
  .string({ minLength: 2, maxLength: 100 })
  .filter((s) => s.trim().length >= 2)
  .map((s) => s.trim() || 'Company');

/**
 * Generate a valid event status
 */
const eventStatusArbitrary = fc.constantFrom('Pending', 'Approved', 'Rejected') as fc.Arbitrary<
  'Pending' | 'Approved' | 'Rejected'
>;

/**
 * Generate a valid date string (ISO format)
 */
const dateStringArbitrary = fc
  .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
  .filter((d) => !isNaN(d.getTime())) // Filter out invalid dates
  .map((d) => d.toISOString());

/**
 * Generate a valid location object (non-whitespace)
 */
const locationArbitrary = fc.record({
  postalCode: fc.string({ minLength: 5, maxLength: 10 }).filter((s) => s.trim().length >= 5),
  streetName: fc.string({ minLength: 3, maxLength: 100 }).filter((s) => s.trim().length >= 3),
});

/**
 * Generate a serialized event for testing
 */
/**
 * Generate a MongoDB ObjectId-like string (24 hex characters)
 */
const objectIdArbitrary = fc
  .array(fc.integer({ min: 0, max: 15 }), { minLength: 24, maxLength: 24 })
  .map((arr) => arr.map((n) => n.toString(16)).join(''));

const serializedEventArbitrary = fc
  .record({
    _id: objectIdArbitrary,
    companyName: fc.string({ minLength: 2, maxLength: 50 }).filter((s) => s.trim().length >= 2),
    eventItemName: fc.string({ minLength: 3, maxLength: 50 }).filter((s) => s.trim().length >= 3),
    vendorName: fc.string({ minLength: 2, maxLength: 50 }).filter((s) => s.trim().length >= 2),
    proposedDates: fc.array(dateStringArbitrary, { minLength: 3, maxLength: 3 }),
    location: locationArbitrary,
    status: eventStatusArbitrary,
    dateCreated: dateStringArbitrary,
  })
  .chain((base) => {
    // Add conditional fields based on status
    if (base.status === 'Approved') {
      return fc.tuple(
        fc.constant(base),
        fc.oneof(
          fc.constant(base.proposedDates[0]),
          fc.constant(base.proposedDates[1]),
          fc.constant(base.proposedDates[2])
        )
      ).map(([b, confirmedDate]) => ({
        _id: b._id,
        companyName: b.companyName,
        eventItemName: b.eventItemName,
        vendorName: b.vendorName,
        proposedDates: b.proposedDates,
        location: b.location,
        status: b.status,
        dateCreated: b.dateCreated,
        confirmedDate,
        remarks: null,
      }));
    } else if (base.status === 'Rejected') {
      return fc.tuple(
        fc.constant(base),
        fc.string({ minLength: 1, maxLength: 200 })
      ).map(([b, remarks]) => ({
        _id: b._id,
        companyName: b.companyName,
        eventItemName: b.eventItemName,
        vendorName: b.vendorName,
        proposedDates: b.proposedDates,
        location: b.location,
        status: b.status,
        dateCreated: b.dateCreated,
        confirmedDate: null,
        remarks,
      }));
    } else {
      return fc.constant({
        _id: base._id,
        companyName: base.companyName,
        eventItemName: base.eventItemName,
        vendorName: base.vendorName,
        proposedDates: base.proposedDates,
        location: base.location,
        status: base.status,
        dateCreated: base.dateCreated,
        confirmedDate: null,
        remarks: null,
      });
    }
  })
  .map(
    (event): SerializedEvent => ({
      _id: event._id,
      companyId: {
        _id: fc.sample(objectIdArbitrary, 1)[0],
        name: event.companyName,
      },
      eventItemId: {
        _id: fc.sample(objectIdArbitrary, 1)[0],
        name: event.eventItemName,
      },
      vendorId: {
        _id: fc.sample(objectIdArbitrary, 1)[0],
        name: event.vendorName,
      },
      proposedDates: event.proposedDates,
      location: event.location,
      status: event.status,
      confirmedDate: event.confirmedDate,
      remarks: event.remarks,
      dateCreated: event.dateCreated,
    })
  );

describe('HR Dashboard Property Tests', () => {
  // Feature: wellness-event-booking, Property 3: Company name auto-population
  describe('Property 3: Company name auto-population', () => {
    it('should auto-populate company name field for any company', () => {
      fc.assert(
        fc.property(
          companyNameArbitrary,
          objectIdArbitrary,
          (companyName, companyId) => {
            // Render the EventForm component
            const { container } = render(
              <ToastProvider>
                <EventForm companyName={companyName} companyId={companyId} />
              </ToastProvider>
            );

            // Find the company name input field
            const companyInput = container.querySelector('#companyName') as HTMLInputElement;

            // Verify the field exists and is populated
            expect(companyInput).toBeInTheDocument();
            expect(companyInput.value).toBe(companyName);
            expect(companyInput.readOnly).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: wellness-event-booking, Property 10: Event table rendering completeness
  describe('Property 10: Event table rendering completeness', () => {
    it('should render all required columns for any event', () => {
      fc.assert(
        fc.property(serializedEventArbitrary, (event) => {
          // Render the EventTable with a single event
          const { container } = render(<EventTable events={[event]} userRole="HR_ADMIN" />);

          // Verify table structure exists
          const table = container.querySelector('table');
          expect(table).toBeInTheDocument();

          // Verify table has thead and tbody
          const thead = container.querySelector('thead');
          const tbody = container.querySelector('tbody');
          expect(thead).toBeInTheDocument();
          expect(tbody).toBeInTheDocument();

          // Verify 6 header columns exist (Event Name, Vendor, Date(s), Status, Created, Actions)
          const headers = thead!.querySelectorAll('th');
          expect(headers.length).toBe(6);

          // Verify tbody has exactly one row for the single event
          const rows = tbody!.querySelectorAll('tr');
          expect(rows.length).toBe(1);

          // Verify the row has 6 cells
          const cells = rows[0].querySelectorAll('td');
          expect(cells.length).toBe(6);

          // Verify event data is in the cells
          expect(cells[0].textContent).toBe(event.eventItemId.name); // Event Name
          expect(cells[1].textContent).toBe(event.vendorId.name); // Vendor
          expect(cells[2].textContent).toBeTruthy(); // Date(s) - should have some content
          expect(cells[3].textContent).toContain(event.status); // Status
          expect(cells[4].textContent).toBeTruthy(); // Created date
          expect(cells[5].textContent).toBe('View'); // View button
        }),
        { numRuns: 100 }
      );
    });

    it('should render multiple events with all required information', () => {
      fc.assert(
        fc.property(
          fc.array(serializedEventArbitrary, { minLength: 1, maxLength: 10 }),
          (events) => {
            // Clean up before rendering to ensure no leftover DOM
            cleanup();
            
            // Render the EventTable with multiple events
            const { container } = render(<EventTable events={events} userRole="HR_ADMIN" />);

            // Verify table structure
            const tbody = container.querySelector('tbody');
            expect(tbody).toBeInTheDocument();

            // Verify correct number of rows
            const rows = tbody!.querySelectorAll('tr');
            expect(rows.length).toBe(events.length);

            // Verify each row has 6 cells
            rows.forEach((row) => {
              const cells = row.querySelectorAll('td');
              expect(cells.length).toBe(6);
            });

            // Verify correct number of view buttons within the container
            const viewButtons = container.querySelectorAll('button');
            expect(viewButtons.length).toBe(events.length);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // Feature: wellness-event-booking, Property 11: Event modal display
  describe('Property 11: Event modal display', () => {
    it('should display all event information in modal for any event', () => {
      fc.assert(
        fc.property(serializedEventArbitrary, (event) => {
          // Clean up before rendering
          cleanup();
          
          // Render the EventTable and click view button
          const { container } = render(
            <ToastProvider>
              <EventTable events={[event]} userRole="HR_ADMIN" />
            </ToastProvider>
          );

          // Find and click the view button
          const viewButtons = screen.getAllByText('View');
          expect(viewButtons.length).toBe(1);
          
          fireEvent.click(viewButtons[0]);

          // After clicking, verify modal is rendered by checking for the modal container
          const modalContainer = container.querySelector('.fixed.inset-0');
          expect(modalContainer).toBeInTheDocument();

          // Verify modal content container exists
          const modalContent = container.querySelector('.relative.w-full.max-w-2xl');
          expect(modalContent).toBeInTheDocument();

          // Verify modal has the event details heading
          const heading = modalContent!.querySelector('h2');
          expect(heading).toBeInTheDocument();
          expect(heading!.textContent).toBe('Event Details');

          // Verify status badge is displayed
          const statusBadge = modalContent!.querySelector('.inline-flex.rounded-full');
          expect(statusBadge).toBeInTheDocument();
          expect(statusBadge!.textContent).toBe(event.status);

          // Verify close button exists
          const closeButton = modalContent!.querySelector('button');
          expect(closeButton).toBeInTheDocument();

          // Verify no Approve or Reject buttons for HR role
          expect(screen.queryByText('Approve')).not.toBeInTheDocument();
          expect(screen.queryByText('Reject')).not.toBeInTheDocument();

          // Verify key information sections exist
          const labels = modalContent!.querySelectorAll('label');
          const labelTexts = Array.from(labels).map((l) => l.textContent);
          
          expect(labelTexts).toContain('Company');
          expect(labelTexts).toContain('Event Type');
          expect(labelTexts).toContain('Vendor');
          expect(labelTexts).toContain('Proposed Dates');
          expect(labelTexts).toContain('Location');
          expect(labelTexts).toContain('Date Created');

          // Verify conditional fields
          if (event.confirmedDate) {
            expect(labelTexts).toContain('Confirmed Date');
          }

          if (event.remarks) {
            expect(labelTexts).toContain('Rejection Remarks');
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
