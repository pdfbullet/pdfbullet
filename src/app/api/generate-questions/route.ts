import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { inputText } = await request.json();

    if (!inputText || !inputText.trim()) {
      return NextResponse.json(
        { error: 'Please enter some text to generate questions from.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Groq API key is not configured. Please add GROQ_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert quiz generator. When given a piece of text, you generate exactly 5 diverse questions based on it. 
You MUST respond with ONLY a valid JSON object in this exact format, no other text:
{
  "questions": [
    {
      "question": "Question text here?",
      "type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A"
    },
    {
      "question": "True or false question?",
      "type": "true_false",
      "answer": "True"
    },
    {
      "question": "Short answer question?",
      "type": "short_answer",
      "answer": "Concise answer here"
    }
  ]
}
Include a mix of multiple_choice (with 4 options), true_false, and short_answer types. Always return exactly 5 questions.`,
        },
        {
          role: 'user',
          content: `Generate 5 questions based on this text:\n\n"${inputText}"`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const jsonResponse = JSON.parse(raw);

    if (!jsonResponse.questions || !Array.isArray(jsonResponse.questions)) {
      throw new Error('Received an unexpected format from the AI.');
    }

    return NextResponse.json(jsonResponse);
  } catch (err: any) {
    console.error('AI Question Gen server error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate questions.' },
      { status: 500 }
    );
  }
}
