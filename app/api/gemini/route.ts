import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with API key
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
  try {
    // Try to get session, but allow access even without authentication
    let session = null;
    let userType = 'visitor';
    try {
      session = await getServerSession(authOptions);
      userType = (session?.user as any)?.userType || 'user';
    } catch (error) {
      console.warn('Session check failed, proceeding without authentication:', error);
    }

    const body = await req.json();
    const { message, context } = body;

    console.log('Gemini API Request:', { 
      message: message?.substring(0, 50), 
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length 
    });

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!genAI || !apiKey) {
      console.error('Gemini API not initialized - API key missing');
      return NextResponse.json({ 
        response: 'I apologize, but the AI service is currently unavailable. The API key is not configured. Please ensure GEMINI_API_KEY is set in your environment variables.',
        timestamp: new Date().toISOString() 
      });
    }

    // Try different models in order of preference
    const modelsToTry = [
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash-exp',
      'gemini-flash-latest'
    ];

    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying model: ${modelName}`);
        
        // Initialize Gemini model
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          },
        });

        // Construct prompt with context
        const systemContext = context || `You are an AI assistant for CuraLink, a platform connecting patients with clinical trials and researchers. The user is a ${userType}. Provide helpful, accurate, and compassionate responses related to clinical research, health conditions, and medical information. Keep responses concise and friendly.`;

        const prompt = `${systemContext}\n\nUser: ${message}\n\nAssistant:`;

        console.log(`Sending request to Gemini API with model ${modelName}...`);

        // Generate response with timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 30000)
        );

        const result = await Promise.race([
          model.generateContent(prompt),
          timeoutPromise
        ]) as any;

        const response = result.response;
        let text = response.text();
        
        // Remove markdown formatting
        text = text.replace(/\*\*/g, '').replace(/\*/g, '');

        console.log(`Gemini API Response received successfully from ${modelName}`);

        return NextResponse.json({ 
          response: text,
          timestamp: new Date().toISOString(),
          model: modelName
        });

      } catch (modelError: any) {
        console.warn(`Model ${modelName} failed:`, modelError.message);
        lastError = modelError;
        // Try next model
        continue;
      }
    }

    // If all models failed, return a friendly error
    console.error('All Gemini models failed:', lastError);
    
    return NextResponse.json({ 
      response: `I'm having trouble connecting to the AI service right now. This might be due to:\n\n1. API rate limits\n2. Network connectivity issues\n3. Service availability\n\nPlease try again in a moment. If the problem persists, you can:\n- Ask in the FAQ section\n- Contact support\n- Try refreshing the page\n\nError: ${lastError?.message || 'Unknown error'}`,
      timestamp: new Date().toISOString(),
      error: true
    });

  } catch (error: any) {
    console.error('Gemini API Error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      details: error.toString(),
      stack: error.stack
    });
    
    return NextResponse.json({ 
      response: 'I apologize, but I encountered an unexpected error. Please try again or contact support if the issue persists.',
      timestamp: new Date().toISOString(),
      error: true,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
