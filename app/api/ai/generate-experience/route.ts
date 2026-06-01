import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobContext, language } = body;

    if (!jobContext || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: jobContext, language' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const prompt = `Generate 3-5 professional bullet points for this job context: ${jobContext}. Make them ATS-friendly, action-oriented, and impactful. Return as a JSON array of strings. Language: ${language}`;

    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate experience from AI service' },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      );
    }

    // Parse JSON array from the response
    let bulletPoints: string[];
    try {
      // Strip markdown code fences if present
      const cleaned = rawText.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
      bulletPoints = JSON.parse(cleaned);
      if (!Array.isArray(bulletPoints)) {
        throw new Error('Not an array');
      }
    } catch {
      // Fallback: split by newlines if JSON parsing fails
      bulletPoints = rawText
        .split('\n')
        .map((line: string) => line.replace(/^[-•*]\s*/, '').trim())
        .filter((line: string) => line.length > 0);
    }

    return NextResponse.json({ bulletPoints });
  } catch (error) {
    console.error('Error in generate-experience route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
