import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth';
import { db } from '@/db';
import { faqChatConversations, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Initialize Gemini AI with API key
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// CuraLink platform knowledge base
const PLATFORM_CONTEXT = `
You are a helpful FAQ assistant for CuraLink, a clinical research platform. Answer questions ONLY about the CuraLink platform, its features, and how to use it.

# About CuraLink:
CuraLink is a platform that connects patients with clinical trials and researchers. It has two main user types:

## For Patients/Caregivers:
- Create profile with health conditions and location
- Browse personalized clinical trials matching their conditions
- Search and filter trials by phase, status, and location
- Save favorite trials, publications, and experts
- Contact researchers and trial administrators
- View relevant publications and research papers
- Access health experts specializing in their conditions
- Participate in forums to ask questions
- Request meetings with researchers
- AI-powered summaries of complex medical information

## For Researchers:
- Create and manage clinical trials
- Update trial status and participant counts
- Search for collaborators by specialty and interests
- Create community forums for their research areas
- Reply to patient questions in forums
- Import publications via ORCID or ResearchGate
- Set availability for patient consultations
- Track saved publications and trials
- AI-generated summaries for trial descriptions

## Platform Features:
- Google OAuth and email/password authentication
- Email verification required for security
- Role-based dashboards (Patient vs Researcher)
- Real-time AI assistance (Gemini-powered)
- Responsive design for mobile, tablet, desktop
- Favorites system to save items
- Global location toggle to see worldwide opportunities
- Search and filter capabilities across all sections
- Profile customization
- Meeting request system
- Secure database storage with encryption

## How to Get Started:
1. Click "Sign In" in the header
2. Choose "Sign Up" 
3. Select role: Patient/Caregiver or Researcher
4. Fill in basic information
5. Verify email address
6. Complete profile setup with relevant details
7. Start exploring personalized content

## Navigation:
- Home: Landing page with overview
- About: Information about ReGeneX mission
- Services: Platform features and offerings
- Contact: Support and inquiries
- FAQ: This page with common questions
- Dashboards: Role-specific interfaces after sign-in

## Security & Privacy:
- HIPAA-compliant data handling
- Bank-level encryption
- Data shared only with explicit user consent
- Secure authentication with NextAuth
- Password reset via email
- Session management

## Support:
- AI Assistant available on every page (purple chat button)
- FAQ page with searchable questions
- Contact form for specific inquiries
- Email support available

Be friendly, concise, and specific. If a question is outside the scope of CuraLink platform usage, politely redirect them to browse the FAQ categories or contact support. Do not provide medical advice or diagnosis.
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, sessionId } = body;

    console.log('FAQ Chat Request:', { message, sessionId, hasApiKey: !!apiKey });

    // Get user session (if logged in)
    const session = await getServerSession();
    let userId: number | null = null;
    
    if (session?.user?.email) {
      const userResult = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.email, session.user.email))
        .limit(1);
      userId = userResult[0]?.id || null;
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Valid message is required' }, { status: 400 });
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (!genAI || !apiKey) {
      console.error('Gemini API not initialized - API key missing');
      return NextResponse.json({ 
        error: 'Gemini API key not configured',
        response: "I apologize, but the AI service is not properly configured. Please contact the administrator or browse the FAQ sections above for answers."
      }, { status: 500 });
    }

    // Initialize Gemini model with the latest available model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    // Construct prompt with ReGeneX-specific context
    const prompt = `${PLATFORM_CONTEXT}

User Question: ${message}

Assistant (answer specifically about CuraLink platform):`;

    console.log('Sending request to Gemini API...');

    // Generate response
    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();
    
    // Remove markdown bold formatting
    text = text.replace(/\*\*/g, '');

    console.log('Gemini API Response received successfully');

    // Save conversation to database
    try {
      await db.insert(faqChatConversations).values({
        userId: userId,
        sessionId: sessionId,
        userMessage: message.trim(),
        assistantResponse: text,
      });
      console.log('Chat conversation saved to database');
    } catch (dbError) {
      console.error('Failed to save chat to database:', dbError);
      // Don't fail the request if database save fails
    }

    return NextResponse.json({ 
      response: text,
      timestamp: new Date().toISOString() 
    });

  } catch (error: any) {
    console.error('FAQ Gemini API Error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      details: error.toString(),
    });
    
    // Provide detailed error information for debugging
    let errorMessage = "I apologize, but I'm having trouble connecting right now.";
    
    if (error.message?.includes('API key')) {
      errorMessage = "API key error detected. Please verify your Gemini API key configuration.";
    } else if (error.message?.includes('quota')) {
      errorMessage = "API quota exceeded. Please check your Gemini API usage limits.";
    } else if (error.message?.includes('model')) {
      errorMessage = "Model configuration error. The Gemini model may need to be updated.";
    }
    
    return NextResponse.json(
      { 
        response: `${errorMessage} Please try asking your question again, or browse the FAQ sections above for immediate answers. You can also contact our support team for help.`,
        timestamp: new Date().toISOString(),
        error: true,
        errorDetails: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 200 } // Return 200 so the UI can show the fallback message
    );
  }
}
