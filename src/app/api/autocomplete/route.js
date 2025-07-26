import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const tonePrompts = {
  professional: "Continue this text in a professional, formal, business-appropriate tone. Be clear, respectful, and maintain professional standards:",
  casual: "Continue this text in a casual, friendly, conversational tone. Be warm, approachable, and use everyday language:",
  creative: "Continue this text in a creative, engaging, imaginative tone. Be expressive, original, and think outside the box:",
  concise: "Continue this text in a concise, direct, brief tone. Get straight to the point and be succinct:"
};

export async function POST(request) {
  try {
    const { text, tone = 'professional' } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required', status: 'error' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured', status: 'error' },
        { status: 500 }
      );
    }

    const prompt = `${tonePrompts[tone] || tonePrompts.professional}

"${text}"

Continue with 5-15 words that naturally complete the sentence. Respond with ONLY the continuation text, no quotes or explanations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful writing assistant that provides natural text continuations. Always respond with only the continuation text, never with quotes, explanations, or meta-commentary."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 50,
      temperature: 0.7,
      top_p: 1.0,
      frequency_penalty: 0.3,
      presence_penalty: 0.3,
    });

    const suggestion = completion.choices[0]?.message?.content?.trim() || '';

    return NextResponse.json({
      suggestion,
      tone,
      status: 'success',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Autocomplete API error:', error);
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded', status: 'error' },
        { status: 429 }
      );
    }

    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key', status: 'error' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate suggestion', status: 'error' },
      { status: 500 }
    );
  }
} 