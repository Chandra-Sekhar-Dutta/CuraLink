import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/db';
import { researcherProjects, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET - List all projects for the current user
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
      return NextResponse.json({ error: 'Only researchers can view projects' }, { status: 403 });
    }

    // Get all projects for this user
    const projects = await db
      .select()
      .from(researcherProjects)
      .where(eq(researcherProjects.userId, currentUser.id));

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectData = await request.json();

    // Get current user
    const currentUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!currentUser || currentUser.userType !== 'researcher') {
      return NextResponse.json({ error: 'Only researchers can create projects' }, { status: 403 });
    }

    // Create new project
    const [newProject] = await db
      .insert(researcherProjects)
      .values({
        userId: currentUser.id,
        title: projectData.title,
        description: projectData.description || null,
        status: projectData.status || 'active',
        phase: projectData.phase || null,
        startDate: projectData.startDate ? new Date(projectData.startDate) : null,
        endDate: projectData.endDate ? new Date(projectData.endDate) : null,
        funding: projectData.funding || null,
        collaborators: projectData.collaborators || null,
        tags: projectData.tags || null,
        visibility: projectData.visibility || 'private',
      })
      .returning();

    return NextResponse.json({
      success: true,
      project: newProject,
    });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
