import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { term } = body;

    if (!term) {
      return NextResponse.json(
        { error: 'Term is required' },
        { status: 400 }
      );
    }

    if (!genAI || !apiKey) {
      console.warn('Gemini API not available, returning original term');
      return NextResponse.json({ 
        correctedTerm: term,
        wasCorrected: false,
        message: 'Spell correction unavailable'
      });
    }

    // Use Gemini to correct medical spelling
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.1, // Low temperature for more precise corrections
      },
    });

    const prompt = `You are a medical spell checker. Correct the spelling of this medical term or disease name. 
If the spelling is already correct, return it unchanged. 
If it's misspelled, return ONLY the corrected term, nothing else.
Do not add any explanations or extra text.

Examples:
Input: "diabetees" → Output: "diabetes"
Input: "malaria" → Output: "malaria"
Input: "dwarfizm" → Output: "dwarfism"
Input: "parkinsons" → Output: "parkinson"
Input: "alzhimer" → Output: "alzheimer"

Input: "${term}"
Output:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let correctedTerm = response.text().trim();
    
    // Clean up the response - remove quotes, extra text, etc.
    correctedTerm = correctedTerm
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/\*\*/g, '') // Remove markdown
      .replace(/^output:\s*/i, '') // Remove "Output:" prefix
      .split('\n')[0] // Take only first line
      .trim()
      .toLowerCase();

    const wasCorrected = correctedTerm.toLowerCase() !== term.toLowerCase();

    console.log(`Spell correction: "${term}" → "${correctedTerm}" (changed: ${wasCorrected})`);

    return NextResponse.json({ 
      success: true,
      originalTerm: term,
      correctedTerm,
      wasCorrected,
    });

  } catch (error: any) {
    console.error('Spell correction error:', error);
    const body = await request.json().catch(() => ({ term: '' }));
    // Return original term on error
    return NextResponse.json(
      { 
        correctedTerm: body.term || '',
        wasCorrected: false,
        error: error.message 
      },
      { status: 500 }
    );
  }
}
