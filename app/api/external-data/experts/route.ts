import { NextRequest, NextResponse } from 'next/server';
import { fetchExpertsByCondition } from '@/lib/externalData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conditions = searchParams.get('conditions');
    const maxResults = parseInt(searchParams.get('maxResults') || '20');
    
    if (!conditions) {
      return NextResponse.json(
        { error: 'Conditions parameter is required' },
        { status: 400 }
      );
    }
    
    const conditionArray = conditions.split(',').map(c => c.trim()).filter(Boolean);
    
    if (conditionArray.length === 0) {
      return NextResponse.json({ experts: [] });
    }
    
    const experts = await fetchExpertsByCondition(conditionArray, maxResults);
    
    return NextResponse.json({ experts, count: experts.length });
  } catch (error) {
    console.error('Error in experts API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
