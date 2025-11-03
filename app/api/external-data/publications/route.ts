import { NextRequest, NextResponse } from 'next/server';
import { fetchPubMedPublications } from '@/lib/externalData';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const conditions = searchParams.get('conditions')?.split(',') || [];
    const maxResults = parseInt(searchParams.get('maxResults') || '10');

    if (conditions.length === 0) {
      return NextResponse.json({ publications: [] });
    }

    const publications = await fetchPubMedPublications(conditions, maxResults);

    return NextResponse.json({ 
      success: true,
      publications,
      count: publications.length 
    });
  } catch (error: any) {
    console.error('Error in publications API:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
