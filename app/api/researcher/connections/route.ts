import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/db';
import { researcherConnections, users } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET - List all connections for the current user
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
      return NextResponse.json({ error: 'Only researchers can manage connections' }, { status: 403 });
    }

    // Get all connections where user is either requester or receiver
    const connections = await db
      .select()
      .from(researcherConnections)
      .where(
        or(
          eq(researcherConnections.requesterId, currentUser.id),
          eq(researcherConnections.receiverId, currentUser.id)
        )
      );

    // Fetch user details for each connection
    const connectionsWithUsers = await Promise.all(
      connections.map(async (conn: any) => {
        // Fetch both requester and receiver
        const requester = await db.query.users.findFirst({
          where: eq(users.id, conn.requesterId),
        });
        
        const receiver = await db.query.users.findFirst({
          where: eq(users.id, conn.receiverId),
        });

        return {
          id: conn.id,
          requesterId: conn.requesterId,
          receiverId: conn.receiverId,
          status: conn.status,
          createdAt: conn.createdAt,
          updatedAt: conn.updatedAt,
          requester: requester ? {
            id: requester.id,
            name: requester.name,
            email: requester.email,
            image: requester.image,
          } : null,
          receiver: receiver ? {
            id: receiver.id,
            name: receiver.name,
            email: receiver.email,
            image: receiver.image,
          } : null,
          isRequester: conn.requesterId === currentUser.id,
        };
      })
    );

    return NextResponse.json({
      success: true,
      connections: connectionsWithUsers,
    });
  } catch (error: any) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Send a connection request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverId } = await request.json();

    if (!receiverId) {
      return NextResponse.json({ error: 'receiverId is required' }, { status: 400 });
    }

    // Get current user
    const currentUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!currentUser || currentUser.userType !== 'researcher') {
      return NextResponse.json({ error: 'Only researchers can send connection requests' }, { status: 403 });
    }

    if (currentUser.id === receiverId) {
      return NextResponse.json({ error: 'Cannot send connection request to yourself' }, { status: 400 });
    }

    // Check if connection already exists
    const existingConnection = await db.query.researcherConnections.findFirst({
      where: or(
        and(
          eq(researcherConnections.requesterId, currentUser.id),
          eq(researcherConnections.receiverId, receiverId)
        ),
        and(
          eq(researcherConnections.requesterId, receiverId),
          eq(researcherConnections.receiverId, currentUser.id)
        )
      ),
    });

    if (existingConnection) {
      return NextResponse.json(
        { error: 'Connection request already exists', status: existingConnection.status },
        { status: 400 }
      );
    }

    // Create new connection request
    const [newConnection] = await db
      .insert(researcherConnections)
      .values({
        requesterId: currentUser.id,
        receiverId: receiverId,
        status: 'pending',
      })
      .returning();

    return NextResponse.json({
      success: true,
      connection: newConnection,
    });
  } catch (error: any) {
    console.error('Error creating connection request:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Accept or reject a connection request
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connectionId, action } = await request.json();

    if (!connectionId || !action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'connectionId and valid action (accept/reject) are required' }, { status: 400 });
    }

    // Get current user
    const currentUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!currentUser || currentUser.userType !== 'researcher') {
      return NextResponse.json({ error: 'Only researchers can manage connections' }, { status: 403 });
    }

    // Get the connection
    const connection = await db.query.researcherConnections.findFirst({
      where: eq(researcherConnections.id, connectionId),
    });

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Only the receiver can accept/reject
    if (connection.receiverId !== currentUser.id) {
      return NextResponse.json({ error: 'You can only respond to requests sent to you' }, { status: 403 });
    }

    // Update the connection status
    const [updatedConnection] = await db
      .update(researcherConnections)
      .set({
        status: action === 'accept' ? 'accepted' : 'rejected',
        updatedAt: new Date(),
      })
      .where(eq(researcherConnections.id, connectionId))
      .returning();

    return NextResponse.json({
      success: true,
      connection: updatedConnection,
    });
  } catch (error: any) {
    console.error('Error updating connection request:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
