import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { grade, subject, topic, duration, style } = await request.json();

    if (!grade || !subject || !topic) {
      return NextResponse.json(
        { error: 'Please fill in Grade Level, Subject, and Topic.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Groq API key is not configured on the server.' },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    const prompt = `Create a comprehensive, detailed lesson plan for the following class:

- Grade Level: ${grade}
- Subject: ${subject}
- Topic: ${topic}
- Duration: ${duration || 45} minutes
${style ? `- Teaching Style / Special Notes: ${style}` : ''}

Format the lesson plan with the following clearly labeled sections using markdown bold headings (**Heading:**):

**Lesson Title:**
A creative, descriptive title for this lesson.

**Lesson Objectives:**
3-5 clear, measurable learning objectives starting with action verbs (e.g., Students will be able to...).

**Required Materials:**
A bulleted list of all materials, resources, and equipment needed.

**Vocabulary / Key Terms:**
5-8 important vocabulary words or concepts students should know, with brief definitions.

**Introduction / Hook (5-10 minutes):**
An engaging opening activity, question, or demonstration to capture student interest and activate prior knowledge.

**Main Activities (${Math.round(parseInt(duration || '45') * 0.55)} minutes):**
Step-by-step breakdown of teaching activities, including:
- Direct instruction / explanation
- Guided practice
- Student activity or group work
- Discussion points

**Differentiation Strategies:**
How to support struggling learners and challenge advanced students.

**Assessment / Check for Understanding (5-10 minutes):**
How to gauge student comprehension during and at the end of the lesson (formative assessment ideas).

**Conclusion & Wrap-up (5 minutes):**
How to close the lesson, summarize key points, and connect to future learning.

**Homework Assignment:**
A specific, meaningful homework task that reinforces the lesson objectives.

**Teacher Notes:**
Any tips, common misconceptions to address, or extension activities.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert curriculum designer and educator with 20+ years of experience creating engaging, standards-aligned lesson plans. Your lesson plans are detailed, practical, and ready to use in the classroom. Always respond in clear markdown format with bold headings.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const lessonPlan = completion.choices[0]?.message?.content || '';
    if (!lessonPlan) {
      throw new Error('No content received from AI.');
    }

    return NextResponse.json({ lessonPlan });
  } catch (err: any) {
    console.error('Lesson Plan Gen error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate lesson plan.' },
      { status: 500 }
    );
  }
}
