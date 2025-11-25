import { NextRequest, NextResponse } from 'next/server';
import EventService from '@/lib/services/EventService';
import { connectDB } from '@/lib/db/connection';

/**
 * GET /api/events
 * Retrieve events based on authenticated user's role and scope
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Extract user info from middleware headers
    const userRole = request.headers.get('x-user-role');
    const companyId = request.headers.get('x-company-id');
    const vendorId = request.headers.get('x-vendor-id');

    if (!userRole) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    let events;

    // Route to appropriate service method based on role
    if (userRole === 'HR_ADMIN') {
      if (!companyId) {
        return NextResponse.json(
          { error: { code: 'INVALID_USER', message: 'HR Admin must have associated company' } },
          { status: 400 }
        );
      }
      events = await EventService.getEventsByCompany(companyId);
    } else if (userRole === 'VENDOR_ADMIN') {
      if (!vendorId) {
        return NextResponse.json(
          { error: { code: 'INVALID_USER', message: 'Vendor Admin must have associated vendor' } },
          { status: 400 }
        );
      }
      events = await EventService.getEventsByVendor(vendorId);
    } else {
      return NextResponse.json(
        { error: { code: 'INVALID_ROLE', message: 'Invalid user role' } },
        { status: 403 }
      );
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 * Create a new wellness event request
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Extract user info from middleware headers
    const userRole = request.headers.get('x-user-role');
    const companyId = request.headers.get('x-company-id');

    // Validate user is HR Admin
    if (userRole !== 'HR_ADMIN') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Only HR Admins can create events' } },
        { status: 403 }
      );
    }

    if (!companyId) {
      return NextResponse.json(
        { error: { code: 'INVALID_USER', message: 'HR Admin must have associated company' } },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { eventItemId, proposedDates, location } = body;

    // Validate request body
    if (!eventItemId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Event item is required' } },
        { status: 400 }
      );
    }

    if (!proposedDates || !Array.isArray(proposedDates)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Proposed dates must be an array' } },
        { status: 400 }
      );
    }

    if (proposedDates.length !== 3) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Exactly 3 proposed dates required' } },
        { status: 400 }
      );
    }

    if (!location || !location.postalCode || !location.streetName) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Location with postal code and street name is required' } },
        { status: 400 }
      );
    }

    // Convert date strings to Date objects
    const parsedDates = proposedDates.map((date: string) => new Date(date));

    // Call EventService.createEvent
    const event = await EventService.createEvent(
      {
        eventItemId,
        proposedDates: parsedDates,
        location,
      },
      companyId
    );

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    // Handle validation errors from service layer
    if (error instanceof Error) {
      if (error.message.includes('Event item not found')) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: error.message } },
          { status: 404 }
        );
      }
      if (error.message.includes('required') || error.message.includes('Exactly 3')) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: error.message } },
          { status: 400 }
        );
      }
    }

    console.error('Create event error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
