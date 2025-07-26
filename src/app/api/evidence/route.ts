import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface EvidenceItem {
  text: string;
  context: string;
  source: string;
  position: string;
  relevanceScore: number;
  relevanceReason: string;
  type: string;
}

interface Evidence {
  statistics: EvidenceItem[];
  quotes: EvidenceItem[];
  sourceInfo: any;
  recommendations: string;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get('file') as File;
    const userText = data.get('userText') as string;

    if (!file || !userText) {
      return NextResponse.json(
        { error: 'File and user text are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.txt')) {
      return NextResponse.json(
        { error: 'Only .txt files are supported' },
        { status: 400 }
      );
    }

    // Read the file content
    const fileBuffer = await file.arrayBuffer();
    const fileContent = new TextDecoder().decode(fileBuffer);

    // Use OpenAI to extract relevant quotes and statistics
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert at finding relevant quotes and statistics from source material. 
          
          Extract 3-5 of the most relevant quotes and statistics from the provided source text that would support the user's writing.
          
          Return your response as a JSON object with this exact structure:
          {
            "quotes": [
              {
                "text": "exact quote text",
                "context": "surrounding context for the quote",
                "source": "speaker or source if mentioned"
              }
            ],
            "statistics": [
              {
                "text": "the statistic (e.g., '75% of students')",
                "context": "context around the statistic",
                "source": "study or source if mentioned"
              }
            ]
          }
          
          Focus on finding content that directly relates to or supports the user's writing theme.`
        },
        {
          role: "user",
          content: `User's writing: "${userText}"
          
          Source material to extract from: "${fileContent.substring(0, 6000)}"
          
          Please extract the most relevant quotes and statistics that would support this writing.`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    let extractedEvidence;
    try {
      extractedEvidence = JSON.parse(responseContent);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      extractedEvidence = { quotes: [], statistics: [] };
    }

    // Format the response to match our interface
    const formattedEvidence: Evidence = {
      statistics: (extractedEvidence.statistics || []).map((stat: any, index: number) => ({
        text: stat.text || '',
        context: stat.context || '',
        source: stat.source || '',
        position: `Item ${index + 1}`,
        relevanceScore: 0.8,
        relevanceReason: '',
        type: 'statistic'
      })),
      quotes: (extractedEvidence.quotes || []).map((quote: any, index: number) => ({
        text: quote.text || '',
        context: quote.context || '',
        source: quote.source || '',
        position: `Item ${index + 1}`,
        relevanceScore: 0.8,
        relevanceReason: '',
        type: 'quote'
      })),
      sourceInfo: {
        file: file.name
      },
      recommendations: ''
    };

    return NextResponse.json({
      success: true,
      evidence: formattedEvidence
    });

  } catch (error) {
    console.error('Evidence extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract evidence from file' },
      { status: 500 }
    );
  }
} 