import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const flipbook = await request.json();
    const id = flipbook.id || Date.now();

    const dirPath = path.join(process.cwd(), 'public', 'uploads', 'flipbooks');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, `${id}.json`);
    
    // Format createdAt as ISO string for consistency
    const dataToSave = {
      ...flipbook,
      id: Number(id),
      createdAt: flipbook.createdAt || new Date().toISOString()
    };

    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));

    return NextResponse.json({ success: true, id: Number(id) });
  } catch (err: any) {
    console.error('Save flipbook server error:', err);
    return NextResponse.json({ error: err.message || 'Failed to save flipbook on server.' }, { status: 500 });
  }
}
