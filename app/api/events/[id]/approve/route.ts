import { NextRequest, NextResponse } from 'next/server';
import EventService from '@/lib/services/EventService';
import { connectDB } from '@/lib/db/connection';

/**
 * POST /api/events/[id]/approve
 * Approve an event with a confirmed date
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: eventId } = await params;

    // Extract user info from middleware headers
    const userRole = request.headers.get('x-user-role');
    const vendorId = request.headers.get('x-vendor-id');

    // Validate user is Vendor Admin
    if (userRole !== 'VENDOR_ADMIN') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Only Vendor Admins can approve events' } },
        { status: 403 }
      );
    }

    if (!vendorId) {
      return NextResponse.json(
        { error: { code: 'INVALID_USER', message: 'Vendor Admin must have associated vendor' } },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { confirmedDate } = body;

    // Validate confirmed date is provided
    if (!confirmedDate) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Confirmed date is required' } },
        { status: 400 }
      );
    }

    // Convert to Date object
    const parsedDate = new Date(confirmedDate);

    // Validate date is valid
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid date format, expected ISO 8601' } },
        { status: 400 }
      );
    }

    // Call EventService.approveEvent
    // Service will validate:
    // - Event belongs to vendor
    // - Confirmed date is one of proposed dates
    // - Event is in Pending status
    const updatedEvent = await EventService.approveEvent(eventId, parsedDate, vendorId);

    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    // Handle specific errors from service layer
    if (error instanceof Error) {
      if (error.message === 'Event not found') {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: error.message } },
          { status: 404 }
        );
      }
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: { code: 'FORBIDDEN', message: error.message } },
          { status: 403 }
        );
      }
      if (error.message.includes('not in Pending status')) {
        return NextResponse.json(
          { error: { code: 'INVALID_STATE', message: error.message } },
          { status: 400 }
        );
      }
      if (error.message.includes('must be one of the proposed dates')) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: error.message } },
          { status: 400 }
        );
      }
    }

    console.error('Approve event error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
