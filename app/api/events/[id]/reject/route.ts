import { NextRequest, NextResponse } from 'next/server';
import EventService from '@/lib/services/EventService';
import { connectDB } from '@/lib/db/connection';

/**
 * POST /api/events/[id]/reject
 * Reject an event with remarks
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
        { error: { code: 'FORBIDDEN', message: 'Only Vendor Admins can reject events' } },
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
    const { remarks } = body;

    // Validate remarks are not empty
    if (!remarks || typeof remarks !== 'string' || remarks.trim().length === 0) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Rejection remarks cannot be empty' } },
        { status: 400 }
      );
    }

    // Call EventService.rejectEvent
    // Service will validate:
    // - Event belongs to vendor
    // - Event is in Pending status
    // - Remarks are not empty (double-check)
    const updatedEvent = await EventService.rejectEvent(eventId, remarks, vendorId);

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
      if (error.message.includes('cannot be empty')) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: error.message } },
          { status: 400 }
        );
      }
    }

    console.error('Reject event error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
