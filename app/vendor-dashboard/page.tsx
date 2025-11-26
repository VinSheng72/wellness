import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthService from '@/lib/services/AuthService';
import EventService from '@/lib/services/EventService';
import VendorRepository from '@/lib/repositories/VendorRepository';
import { connectDB } from '@/lib/db';
import EventTable from '../hr-dashboard/components/EventTable';

/**
 * Vendor Admin Dashboard - Server Component
 * Fetches events for the authenticated user's vendor
 * Requirements: 4.1, 4.2
 */
export default async function VendorDashboardPage() {
  // Connect to database
  await connectDB();
  
  // Get session token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    redirect('/login');
  }

  // Verify session and get user info
  const userInfo = await AuthService.verifySession(token);

  if (!userInfo || userInfo.role !== 'VENDOR_ADMIN' || !userInfo.vendorId) {
    redirect('/login');
  }

  // Fetch vendor information
  const vendor = await VendorRepository.findById(userInfo.vendorId);

  if (!vendor) {
    redirect('/login');
  }

  // Fetch events for this vendor
  const events = await EventService.getEventsByVendor(userInfo.vendorId);

  // Serialize events for client components (convert MongoDB documents to plain objects)
  const serializedEvents = events.map((event) => ({
    _id: event._id.toString(),
    companyId: typeof event.companyId === 'object' && 'name' in event.companyId
      ? { _id: event.companyId._id.toString(), name: String(event.companyId.name) }
      : { _id: event.companyId.toString(), name: '' },
    eventItemId: typeof event.eventItemId === 'object' && 'name' in event.eventItemId
      ? { _id: event.eventItemId._id.toString(), name: String(event.eventItemId.name) }
      : { _id: event.eventItemId.toString(), name: '' },
    vendorId: typeof event.vendorId === 'object' && 'name' in event.vendorId
      ? { _id: event.vendorId._id.toString(), name: String(event.vendorId.name) }
      : { _id: event.vendorId.toString(), name: '' },
    proposedDates: event.proposedDates.map((date) => date.toISOString()),
    location: event.location,
    status: event.status,
    confirmedDate: event.confirmedDate?.toISOString() || null,
    remarks: event.remarks || null,
    dateCreated: event.dateCreated.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Vendor Admin Dashboard
            </h1>
            <div className="text-sm text-gray-600">
              {vendor.name} | {userInfo.username}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Events Table */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Event Requests
            </h2>
            <EventTable events={serializedEvents} userRole="VENDOR_ADMIN" />
          </div>
        </div>
      </main>
    </div>
  );
}
