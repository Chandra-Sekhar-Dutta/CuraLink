import { NextRequest, NextResponse } from 'next/server';
import { fetchClinicalTrials } from '@/lib/externalData';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const conditions = searchParams.get('conditions')?.split(',') || [];
    const location = searchParams.get('location') || undefined;
    const maxResults = parseInt(searchParams.get('maxResults') || '10');

    if (conditions.length === 0) {
      return NextResponse.json({ trials: [] });
    }

    const trials = await fetchClinicalTrials(conditions, location, maxResults);

    return NextResponse.json({ 
      success: true,
      trials,
      count: trials.length 
    });
  } catch (error: any) {
    console.error('Error in clinical trials API:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
