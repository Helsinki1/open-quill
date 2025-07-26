import { NextRequest, NextResponse } from 'next/server';
import { getRelevantHumanitiesArticles } from '../../../../research_rec.js';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Valid text is required' },
        { status: 400 }
      );
    }

    // Get research articles using the research_rec.js functionality
    const articles = await getRelevantHumanitiesArticles(text, 3);
    
    return NextResponse.json({ articles });
  } catch (error: any) {
    console.error('Research API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch research articles' },
      { status: 500 }
    );
  }
} 