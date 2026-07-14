import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Please describe your service or product.' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Groq API key not configured.' }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at generating professional invoice line items. Always respond with valid JSON only — no markdown, no explanation, just the JSON object.',
        },
        {
          role: 'user',
          content: `Based on this description, generate 3-5 realistic invoice line items as a JSON object.

Description: "${prompt}"

Respond ONLY with this exact JSON format:
{
  "items": [
    {
      "name": "Item Name",
      "description": "Brief description of the item or service",
      "quantity": 1,
      "rate": 500,
      "unit": "Service"
    }
  ]
}

Units should be one of: Service, hrs, pcs, item, month, day. Rates should be realistic USD amounts.`,
        },
      ],
      temperature: 0.6,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const result = JSON.parse(raw);

    if (!result.items || !Array.isArray(result.items)) {
      throw new Error('AI returned unexpected format.');
    }

    return NextResponse.json({ items: result.items });
  } catch (err: any) {
    console.error('Generate invoice items error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate items.' }, { status: 500 });
  }
}
