import { NextRequest, NextResponse } from 'next/server';
import LocationService from '@/lib/services/LocationService';

/**
 * GET /api/postal-code/[code]
 * Lookup street name by postal code
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Call LocationService.lookupPostalCode
    const result = await LocationService.lookupPostalCode(code);

    // Return street name or null
    if (result) {
      return NextResponse.json({ streetName: result.streetName });
    } else {
      return NextResponse.json({ streetName: null });
    }
  } catch (error) {
    // Handle external API errors gracefully
    console.error('Postal code lookup error:', error);
    
    // Return null to allow manual entry fallback
    return NextResponse.json({ streetName: null });
  }
}
