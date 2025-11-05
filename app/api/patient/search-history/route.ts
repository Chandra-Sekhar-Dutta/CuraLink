import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/db';
import { patientSearchedExperts, patientSearchedTrials, patientSearchedPublications, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET - Retrieve search history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'experts' | 'trials' | 'publications'

    // Get current user
    const currentUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!currentUser || currentUser.userType !== 'patient') {
      return NextResponse.json({ error: 'Only patients can access search history' }, { status: 403 });
    }

    let history: any[] = [];

    switch (type) {
      case 'experts':
        history = await db
          .select()
          .from(patientSearchedExperts)
          .where(eq(patientSearchedExperts.userId, currentUser.id))
          .orderBy(desc(patientSearchedExperts.createdAt))
          .limit(50);
        break;
      case 'trials':
        history = await db
          .select()
          .from(patientSearchedTrials)
          .where(eq(patientSearchedTrials.userId, currentUser.id))
          .orderBy(desc(patientSearchedTrials.createdAt))
          .limit(50);
        break;
      case 'publications':
        history = await db
          .select()
          .from(patientSearchedPublications)
          .where(eq(patientSearchedPublications.userId, currentUser.id))
          .orderBy(desc(patientSearchedPublications.createdAt))
          .limit(50);
        break;
      default:
        return NextResponse.json({ error: 'Invalid type. Use: experts, trials, or publications' }, { status: 400 });
    }

    // Parse JSON data
    const parsedHistory = history.map(item => ({
      ...item,
      data: item.expertData || item.trialData || item.publicationData 
        ? JSON.parse(item.expertData || item.trialData || item.publicationData)
        : null,
    }));

    return NextResponse.json({
      success: true,
      history: parsedHistory,
    });
  } catch (error: any) {
    console.error('Error fetching search history:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Save search item to history
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, itemId, itemData } = await request.json();

    if (!type || !itemId || !itemData) {
      return NextResponse.json({ error: 'type, itemId, and itemData are required' }, { status: 400 });
    }

    // Get current user
    const currentUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!currentUser || currentUser.userType !== 'patient') {
      return NextResponse.json({ error: 'Only patients can save search history' }, { status: 403 });
    }

    const jsonData = JSON.stringify(itemData);
    let savedItem;

    switch (type) {
      case 'experts':
        [savedItem] = await db
          .insert(patientSearchedExperts)
          .values({
            userId: currentUser.id,
            expertId: itemId,
            expertData: jsonData,
          })
          .returning();
        break;
      case 'trials':
        [savedItem] = await db
          .insert(patientSearchedTrials)
          .values({
            userId: currentUser.id,
            trialId: itemId,
            trialData: jsonData,
          })
          .returning();
        break;
      case 'publications':
        [savedItem] = await db
          .insert(patientSearchedPublications)
          .values({
            userId: currentUser.id,
            publicationId: itemId,
            publicationData: jsonData,
          })
          .returning();
        break;
      default:
        return NextResponse.json({ error: 'Invalid type. Use: experts, trials, or publications' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      item: savedItem,
    });
  } catch (error: any) {
    console.error('Error saving search history:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
