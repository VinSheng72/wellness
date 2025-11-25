import { NextRequest, NextResponse } from 'next/server';
import EventService from '@/lib/services/EventService';
import { connectDB } from '@/lib/db/connection';

/**
 * GET /api/events/[id]
 * Retrieve a single event by ID with authorization check
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: eventId } = await params;

    // Extract user info from middleware headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Validate event access for authenticated user
    const hasAccess = await EventService.validateEventAccess(eventId, userId, userRole);

    if (!hasAccess) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Unauthorized: You do not have access to this event' } },
        { status: 403 }
      );
    }

    // Use repository directly since we already validated access
    const EventRepository = (await import('@/lib/repositories/EventRepository')).default;
    const eventDetails = await EventRepository.findById(eventId);

    if (!eventDetails) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Event not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ event: eventDetails });
  } catch (error) {
    console.error('Get event by ID error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
