import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/db';
import { users, researcherProfiles, researcherConnections } from '@/db/schema';
import { eq, ne, and, or } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET - Find all researchers except current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user
    const currentUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!currentUser || currentUser.userType !== 'researcher') {
      return NextResponse.json({ error: 'Only researchers can find other researchers' }, { status: 403 });
    }

    // Get all researchers except current user
    const allResearchers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      })
      .from(users)
      .where(
        and(
          eq(users.userType, 'researcher'),
          ne(users.id, currentUser.id)
        )
      );

    // Get their profiles
    const researchersWithProfiles = await Promise.all(
      allResearchers.map(async (researcher: any) => {
        const profile = await db.query.researcherProfiles.findFirst({
          where: eq(researcherProfiles.userId, researcher.id),
        });

        // Check connection status
        const connection = await db.query.researcherConnections.findFirst({
          where: or(
            and(
              eq(researcherConnections.requesterId, currentUser.id),
              eq(researcherConnections.receiverId, researcher.id)
            ),
            and(
              eq(researcherConnections.requesterId, researcher.id),
              eq(researcherConnections.receiverId, currentUser.id)
            )
          ),
        });

        return {
          ...researcher,
          affiliation: profile?.affiliation,
          position: profile?.position,
          specialties: profile?.specialtiesCsv ? profile.specialtiesCsv.split(',').map((s: string) => s.trim()) : [],
          connectionStatus: connection ? connection.status : 'none',
        };
      })
    );

    return NextResponse.json({
      success: true,
      researchers: researchersWithProfiles,
    });
  } catch (error: any) {
    console.error('Error finding researchers:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
