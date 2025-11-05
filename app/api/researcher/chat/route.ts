import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/db';
import { chatMessages, users, researcherConnections } from '@/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET - Get all messages with a specific user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const otherUserId = searchParams.get('userId');

    if (!otherUserId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Get current user
    const currentUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!currentUser || currentUser.userType !== 'researcher') {
      return NextResponse.json({ error: 'Only researchers can access chat' }, { status: 403 });
    }

    // Verify they are connected
    const connection = await db.query.researcherConnections.findFirst({
      where: and(
        or(
          and(
            eq(researcherConnections.requesterId, currentUser.id),
            eq(researcherConnections.receiverId, parseInt(otherUserId))
          ),
          and(
            eq(researcherConnections.requesterId, parseInt(otherUserId)),
            eq(researcherConnections.receiverId, currentUser.id)
          )
        ),
        eq(researcherConnections.status, 'accepted')
      ),
    });

    if (!connection) {
      return NextResponse.json({ error: 'You must be connected to chat with this user' }, { status: 403 });
    }

    // Get all messages between these two users
    const messages = await db
      .select()
      .from(chatMessages)
      .where(
        or(
          and(
            eq(chatMessages.senderId, currentUser.id),
            eq(chatMessages.receiverId, parseInt(otherUserId))
          ),
          and(
            eq(chatMessages.senderId, parseInt(otherUserId)),
            eq(chatMessages.receiverId, currentUser.id)
          )
        )
      )
      .orderBy(chatMessages.createdAt);

    // Mark messages from other user as read
    await db
      .update(chatMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(chatMessages.senderId, parseInt(otherUserId)),
          eq(chatMessages.receiverId, currentUser.id),
          eq(chatMessages.isRead, false)
        )
      );

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Send a message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverId, message } = await request.json();

    if (!receiverId || !message) {
      return NextResponse.json({ error: 'receiverId and message are required' }, { status: 400 });
    }

    // Get current user
    const currentUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!currentUser || currentUser.userType !== 'researcher') {
      return NextResponse.json({ error: 'Only researchers can send chat messages' }, { status: 403 });
    }

    // Verify they are connected
    const connection = await db.query.researcherConnections.findFirst({
      where: and(
        or(
          and(
            eq(researcherConnections.requesterId, currentUser.id),
            eq(researcherConnections.receiverId, receiverId)
          ),
          and(
            eq(researcherConnections.requesterId, receiverId),
            eq(researcherConnections.receiverId, currentUser.id)
          )
        ),
        eq(researcherConnections.status, 'accepted')
      ),
    });

    if (!connection) {
      return NextResponse.json({ error: 'You must be connected to chat with this user' }, { status: 403 });
    }

    // Create new message
    const [newMessage] = await db
      .insert(chatMessages)
      .values({
        senderId: currentUser.id,
        receiverId: receiverId,
        message: message,
        isRead: false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET list of all chat conversations
export async function PUT(request: NextRequest) {
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
      return NextResponse.json({ error: 'Only researchers can access chat' }, { status: 403 });
    }

    // Get all accepted connections
    const connections = await db
      .select()
      .from(researcherConnections)
      .where(
        and(
          or(
            eq(researcherConnections.requesterId, currentUser.id),
            eq(researcherConnections.receiverId, currentUser.id)
          ),
          eq(researcherConnections.status, 'accepted')
        )
      );

    // Get latest message for each conversation
    const conversations = await Promise.all(
      connections.map(async (conn: any) => {
        const otherUserId = conn.requesterId === currentUser.id ? conn.receiverId : conn.requesterId;
        
        // Get other user details
        const otherUser = await db.query.users.findFirst({
          where: eq(users.id, otherUserId),
        });

        // Get latest message
        const [latestMessage] = await db
          .select()
          .from(chatMessages)
          .where(
            or(
              and(
                eq(chatMessages.senderId, currentUser.id),
                eq(chatMessages.receiverId, otherUserId)
              ),
              and(
                eq(chatMessages.senderId, otherUserId),
                eq(chatMessages.receiverId, currentUser.id)
              )
            )
          )
          .orderBy(desc(chatMessages.createdAt))
          .limit(1);

        // Get unread count
        const unreadMessages = await db
          .select()
          .from(chatMessages)
          .where(
            and(
              eq(chatMessages.senderId, otherUserId),
              eq(chatMessages.receiverId, currentUser.id),
              eq(chatMessages.isRead, false)
            )
          );

        return {
          userId: otherUserId,
          user: {
            id: otherUser?.id,
            name: otherUser?.name,
            email: otherUser?.email,
            image: otherUser?.image,
          },
          latestMessage: latestMessage || null,
          unreadCount: unreadMessages.length,
        };
      })
    );

    // Sort by latest message time
    conversations.sort((a, b) => {
      if (!a.latestMessage) return 1;
      if (!b.latestMessage) return -1;
      return new Date(b.latestMessage.createdAt).getTime() - new Date(a.latestMessage.createdAt).getTime();
    });

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
