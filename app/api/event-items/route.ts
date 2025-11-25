import { NextRequest, NextResponse } from 'next/server';
import EventItemRepository from '@/lib/repositories/EventItemRepository';
import { connectDB } from '@/lib/db/connection';

/**
 * GET /api/event-items
 * Retrieve all event items with vendor information
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Fetch all event items from database
    const eventItems = await EventItemRepository.findAll();

    return NextResponse.json({ eventItems });
  } catch (error) {
    console.error('Get event items error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
