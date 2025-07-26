import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Lazy OpenAI client initialization
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

interface ToneAnalysisRequest {
  text: string;
}

interface ToneAnalysisResponse {
  detectedTone?: string;
  detectedPurpose?: string;
  suggestions?: string[];
  error?: string;
}

async function analyzeToneAndPurpose(text: string): Promise<{ tone: string; purpose: string; suggestions: string[] }> {
  try {
    const openai = getOpenAIClient();
    
    const systemPrompt = `You are a writing analysis expert. Analyze the given text and:

1. Detect the tone (professional, casual, creative, concise, witty, instructional, urgent, reflective)
2. Detect the purpose (persuasive, informative, descriptive, flattering, narrative)
3. Provide exactly 2 bullet-point suggestions for improving the tone and purpose

Respond in this exact JSON format:
{
  "tone": "detected_tone",
  "purpose": "detected_purpose", 
  "suggestions": [
    "First suggestion starting with a verb",
    "Second suggestion starting with a verb"
  ]
}

Keep suggestions concise and actionable (max 15 words each).`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this text: "${text}"` }
      ],
      max_tokens: 200,
      temperature: 0.3,
    });
    
    const content = response.choices[0]?.message?.content?.trim() || '';
    
    // Parse JSON response
    try {
      const result = JSON.parse(content);
      return {
        tone: result.tone || 'professional',
        purpose: result.purpose || 'informative',
        suggestions: result.suggestions || ['Consider the tone more carefully', 'Clarify your purpose']
      };
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return {
        tone: 'professional',
        purpose: 'informative',
        suggestions: ['Consider the tone more carefully', 'Clarify your purpose']
      };
    }
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ToneAnalysisResponse>> {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    let data: ToneAnalysisRequest;
    try {
      data = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!data.text) {
      return NextResponse.json(
        { error: 'Missing required field: text' },
        { status: 400 }
      );
    }
    
    const text = data.text.trim();
    
    // Validate inputs
    if (!text) {
      return NextResponse.json(
        { error: 'Text cannot be empty' },
        { status: 400 }
      );
    }
    
    // Skip analysis for very short text
    if (text.length < 10) {
      return NextResponse.json({
        detectedTone: 'professional',
        detectedPurpose: 'informative',
        suggestions: ['Add more content for better analysis', 'Consider your writing goals']
      });
    }
    
    // Analyze tone and purpose
    const analysis = await analyzeToneAndPurpose(text);
    
    return NextResponse.json({
      detectedTone: analysis.tone,
      detectedPurpose: analysis.purpose,
      suggestions: analysis.suggestions
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze tone and purpose',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 