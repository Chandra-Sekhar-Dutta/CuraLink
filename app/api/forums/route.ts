import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

// In-memory storage (will reset on server restart)
// In production, this should use a database
let forumThreads: any[] = [];
let forumCategories: string[] = [];

// Store active researchers for notifications (in-memory)
let activeResearchers: Map<string, { name: string; email: string; lastActive: Date }> = new Map();

// GET - Fetch all threads and categories
export async function GET(request: Request) {
  try {
    // Check if this is a request for researcher list
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'get_researchers') {
      // Return list of active researchers
      const researchers = Array.from(activeResearchers.entries()).map(([userId, info]) => ({
        userId,
        ...info
      }));
      return NextResponse.json({ researchers });
    }
    
    // Try to get session, but allow access even if it fails
    let session = null;
    try {
      session = await getServerSession(authOptions);
    } catch (error) {
      console.warn('Session check failed, allowing access:', error);
    }

    return NextResponse.json({
      threads: forumThreads,
      categories: forumCategories
    });
  } catch (error) {
    console.error('Error fetching forum data:', error);
    return NextResponse.json({ error: 'Failed to fetch forum data' }, { status: 500 });
  }
}

// POST - Create new thread or add reply
export async function POST(request: Request) {
  try {
    // Try to get session, but allow access even if it fails
    let session = null;
    try {
      session = await getServerSession(authOptions);
    } catch (error) {
      console.warn('Session check failed, allowing access:', error);
    }

    const body = await request.json();
    const { action, thread, threadId, reply, category, userId, userName, userEmail } = body;

    if (action === 'register_researcher') {
      // Register researcher for notifications
      if (userId && userName) {
        activeResearchers.set(userId, {
          name: userName,
          email: userEmail || '',
          lastActive: new Date()
        });
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Missing userId or userName' }, { status: 400 });
    }

    if (action === 'create_thread') {
      // Add new thread
      forumThreads = [thread, ...forumThreads];
      
      // Return thread data along with active researchers for notification
      const researchers = Array.from(activeResearchers.entries()).map(([userId, info]) => ({
        userId,
        ...info
      }));
      
      return NextResponse.json({ 
        success: true, 
        threads: forumThreads,
        researchers 
      });
    }

    if (action === 'add_reply') {
      // Add reply to existing thread
      forumThreads = forumThreads.map(t => 
        t.id === threadId 
          ? { ...t, replies: [...t.replies, reply] }
          : t
      );
      return NextResponse.json({ success: true, threads: forumThreads });
    }

    if (action === 'add_category') {
      // Add new category
      if (category && !forumCategories.includes(category)) {
        forumCategories = [...forumCategories, category];
      }
      return NextResponse.json({ success: true, categories: forumCategories });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating forum data:', error);
    return NextResponse.json({ error: 'Failed to update forum data' }, { status: 500 });
  }
}
