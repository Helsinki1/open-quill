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

// Tone modifiers for natural continuation
const TONE_MODIFIERS = {
  professional: "maintaining a professional and polished tone",
  casual: "keeping the casual and friendly tone",
  creative: "continuing with creative and expressive language", 
  concise: "being direct and concise",
  witty: "maintaining the clever and humorous style",
  instructional: "continuing in a clear, educational manner",
  urgent: "keeping the sense of urgency and importance",
  reflective: "maintaining the thoughtful and contemplative tone"
} as const;

// Purpose context hints
const PURPOSE_CONTEXT = {
  persuasive: "continue building the argument persuasively",
  informative: "continue providing helpful information",
  descriptive: "continue with vivid descriptions",
  flattering: "continue with positive and appreciative language",
  narrative: "continue the story naturally"
} as const;

// Genre context (simplified)
const GENRE_CONTEXT = {
  email: "appropriate for email communication",
  essay: "suitable for essay writing",
  "social post": "fitting for social media",
  report: "maintaining report-style language",
  story: "continuing the narrative",
  research: "using scholarly language",
  sales: "maintaining persuasive sales language", 
  education: "keeping educational clarity"
} as const;

type ToneType = keyof typeof TONE_MODIFIERS;
type PurposeType = keyof typeof PURPOSE_CONTEXT;
type GenreType = keyof typeof GENRE_CONTEXT;
type StructureType = 'chronological' | 'problem-solution' | 'cause-effect' | 'compare-contrast' | 'question-answer' | 'counter-argument' | 'for and against' | 'list' | 'inverted pyramid' | 'narrative';

// Request deduplication cache with optimized expiry
const requestCache = new Map<string, { suggestion: string; timestamp: number }>();
const CACHE_EXPIRY = 30 * 1000; // 30 seconds - shorter for more responsive caching

interface AutocompleteRequest {
  text: string;
  tone: string;
  purpose: string;
  genre: string;
  structure: string;
  context?: string;
}

interface AutocompleteResponse {
  suggestion?: string;
  tone?: string;
  purpose?: string;
  genre?: string;
  structure?: string;
  status?: string;
  error?: string;
  details?: string;
}

async function generateAutocomplete(text: string, tone: ToneType, purpose: PurposeType, genre: GenreType, structure: StructureType, context?: string): Promise<string> {
  try {
    // Get lazy-initialized OpenAI client
    const openai = getOpenAIClient();
    
    // Check cache first
    const cacheKey = `${text}_${tone}_${purpose}_${genre}_${structure}_${context || ''}`;
    const currentTime = Date.now();
    
    const cached = requestCache.get(cacheKey);
    if (cached && currentTime - cached.timestamp < CACHE_EXPIRY) {
      return cached.suggestion;
    }
    
    // Create a natural, context-aware system prompt
    const toneHint = TONE_MODIFIERS[tone] || TONE_MODIFIERS.professional;
    const purposeHint = PURPOSE_CONTEXT[purpose] || PURPOSE_CONTEXT.informative;
    const genreHint = GENRE_CONTEXT[genre] || GENRE_CONTEXT.email;
    
    // Much simpler and more natural system prompt
    const systemPrompt = `You are a helpful writing assistant. Your job is to naturally continue the text the user provides, ${toneHint}. The continuation should be contextually appropriate and ${purposeHint} in a way that's ${genreHint}.${context ? ` Context: ${context}` : ''}

Important guidelines:
- Continue the text naturally and coherently
- Match the existing writing style and tone
- Don't repeat what's already written
- Provide only the next logical words or phrase (3-15 words typically)
- Don't add formatting, headers, or structure unless it naturally fits
- Focus on what would logically come next in the sentence or thought`;
    
    // Debug logging to verify context is being received
    if (context) {
      console.log('🔍 Context received:', context);
    }
    
    // Create OpenAI request optimized for speed
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Faster model for better latency
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Continue this text naturally: "${text}"` }
      ],
      max_tokens: 45, // Reduced for faster response while maintaining quality
      temperature: 0.7, // Optimized for speed vs creativity balance
      top_p: 0.9,
      frequency_penalty: 0.1, // Reduced processing overhead
      presence_penalty: 0.05,
      stop: ["\n\n", "...", "***"]
    });
    
    const suggestion = response.choices[0]?.message?.content?.trim() || '';
    
    // Clean up the suggestion - remove quotes, extra formatting
    const cleanSuggestion = suggestion
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/^\*\*.*?\*\*$/, '') // Remove markdown formatting like **text**
      .replace(/^#+\s+/, '') // Remove markdown headers
      .trim();
    
    // Cache the result
    requestCache.set(cacheKey, { suggestion: cleanSuggestion, timestamp: currentTime });
    
    // Clean old cache entries
    requestCache.forEach((value, key) => {
      if (currentTime - value.timestamp >= CACHE_EXPIRY) {
        requestCache.delete(key);
      }
    });
    
    return cleanSuggestion;
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<AutocompleteResponse>> {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    let data: AutocompleteRequest;
    try {
      data = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!data.text || !data.tone || !data.purpose || !data.genre || !data.structure) {
      return NextResponse.json(
        { error: 'Missing required fields: text, tone, purpose, genre, structure' },
        { status: 400 }
      );
    }
    
    const text = data.text.trim();
    const tone = data.tone.trim().toLowerCase() as ToneType;
    const purpose = data.purpose.trim().toLowerCase() as PurposeType;
    const genre = data.genre.trim().toLowerCase() as GenreType;
    const structure = data.structure.trim().toLowerCase() as StructureType;
    const context = data.context?.trim();
    
    // Validate inputs
    if (!text) {
      return NextResponse.json(
        { error: 'Text cannot be empty' },
        { status: 400 }
      );
    }
    
    if (!(tone in TONE_MODIFIERS)) {
      return NextResponse.json(
        { error: `Invalid tone. Must be one of: ${Object.keys(TONE_MODIFIERS).join(', ')}` },
        { status: 400 }
      );
    }
    
    if (!(purpose in PURPOSE_CONTEXT)) {
      return NextResponse.json(
        { error: `Invalid purpose. Must be one of: ${Object.keys(PURPOSE_CONTEXT).join(', ')}` },
        { status: 400 }
      );
    }
    
    if (!(genre in GENRE_CONTEXT)) {
      return NextResponse.json(
        { error: `Invalid genre. Must be one of: ${Object.keys(GENRE_CONTEXT).join(', ')}` },
        { status: 400 }
      );
    }
    
    // Generate suggestion
    const suggestion = await generateAutocomplete(text, tone, purpose, genre, structure, context);
    
    return NextResponse.json({
      suggestion,
      tone,
      purpose,
      genre,
      structure,
      status: 'success'
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate suggestion',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 