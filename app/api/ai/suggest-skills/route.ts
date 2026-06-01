import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobTitle, language } = body;

    if (!jobTitle || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: jobTitle, language' },
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

    const prompt = `Suggest 10 relevant skills for a ${jobTitle} position. Return as a JSON array of strings. Language: ${language}`;

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
        { error: 'Failed to suggest skills from AI service' },
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
    let skills: string[];
    try {
      // Strip markdown code fences if present
      const cleaned = rawText.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
      skills = JSON.parse(cleaned);
      if (!Array.isArray(skills)) {
        throw new Error('Not an array');
      }
    } catch {
      // Fallback: split by commas or newlines if JSON parsing fails
      skills = rawText
        .split(/[,\n]/)
        .map((s: string) => s.replace(/^[-•*\d.]\s*/, '').replace(/"/g, '').trim())
        .filter((s: string) => s.length > 0)
        .slice(0, 10);
    }

    return NextResponse.json({ skills });
  } catch (error) {
    console.error('Error in suggest-skills route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
