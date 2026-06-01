import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobTitle, skills, language } = body;

    if (!jobTitle || !skills || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: jobTitle, skills, language' },
        { status: 400 }
      );
    }

    if (!Array.isArray(skills)) {
      return NextResponse.json(
        { error: 'skills must be an array' },
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

    const prompt = `Generate a professional CV summary for a ${jobTitle} with skills: ${skills.join(', ')}. The summary should be 50-100 words, ATS-friendly, and compelling. Language: ${language}`;

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
        { error: 'Failed to generate summary from AI service' },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();
    const summary = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!summary) {
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      );
    }

    return NextResponse.json({ summary: summary.trim() });
  } catch (error) {
    console.error('Error in generate-summary route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
