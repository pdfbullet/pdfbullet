import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { filename, category } = await request.json();

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required.' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Groq API key is not configured.' }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    const cleanFilename = filename.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');

    const prompt = `Based on the following PDF filename and category, generate a professional flipbook metadata details:
Filename: "${cleanFilename}"
Category: "${category || 'General'}"

Return ONLY a valid JSON object matching this structure (no markdown, no other text):
{
  "title": "A Clean, Capitalized, Catchy Title",
  "description": "An engaging, professional description (2-3 sentences) summarizing what this publication could contain to attract readers.",
  "keywords": "keyword1, keyword2, keyword3, keyword4, keyword5"
}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content optimizer. Return only valid JSON objects matching the requested schema. Do not output any markdown blocks or explanations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const metadata = JSON.parse(content);

    return NextResponse.json({
      title: metadata.title || cleanFilename,
      description: metadata.description || '',
      keywords: metadata.keywords || '',
    });
  } catch (err: any) {
    console.error('Flipbook metadata generator error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate metadata.' },
      { status: 500 }
    );
  }
}
