import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Groq API key not configured.' }, { status: 500 });
    }

    const groq = new Groq({ apiKey });
    let prompt = '';
    let systemMsg = 'You are an expert CV writer and career coach. Write professional, impactful, ATS-friendly content. Be concise but compelling. Do NOT use bullet points or markdown — write in plain text only.';

    if (action === 'generate-summary') {
      const { name, title, skills, experiences } = data;
      prompt = `Write a professional CV summary (3-4 sentences, ~80 words) for:
Name: ${name}
Title: ${title}
Skills: ${skills?.join(', ') || 'various skills'}
Experience: ${experiences?.map((e: any) => `${e.jobTitle} at ${e.company}`).join(', ') || 'professional experience'}

Write in first person. Be confident and specific. Focus on value delivered. No bullets, no markdown.`;
    } else if (action === 'improve-experience') {
      const { jobTitle, company, description } = data;
      prompt = `Improve this work experience description for a CV.
Job Title: ${jobTitle}
Company: ${company}
Current description: "${description || 'No description provided'}"

Rewrite as 2-3 strong bullet points (use <li> HTML tags). Focus on achievements with metrics/impact. Start each with an action verb. Return only the HTML bullet points, nothing else.`;
      systemMsg = 'You are an expert CV writer. Return only HTML list items (<li> tags) with no extra text or markdown.';
    } else if (action === 'improve-education') {
      const { degree, school, description } = data;
      prompt = `Improve this education description for a CV.
Degree: ${degree}
School: ${school}
Current description: "${description || 'No description provided'}"

Rewrite as 1-2 relevant bullet points (use <li> HTML tags). Highlight achievements, GPA if notable, relevant coursework. Return only the HTML bullet points.`;
      systemMsg = 'You are an expert CV writer. Return only HTML list items (<li> tags) with no extra text or markdown.';
    } else if (action === 'suggest-skills') {
      const { title, experiences } = data;
      prompt = `Suggest 8-10 relevant technical and soft skills for a ${title || 'professional'} with experience in: ${experiences?.map((e: any) => e.jobTitle).join(', ') || 'various roles'}.
Return ONLY a JSON array of skill name strings, nothing else. Example: ["React", "TypeScript", "Leadership"]`;
      systemMsg = 'Return only a valid JSON array of skill strings. No explanation, no markdown.';
    } else {
      return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const result = completion.choices[0]?.message?.content?.trim() || '';
    return NextResponse.json({ result });
  } catch (err: any) {
    console.error('CV AI error:', err);
    return NextResponse.json({ error: err.message || 'Failed to enhance CV.' }, { status: 500 });
  }
}
