import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const CLOUD_NAME = 'jtz141my';
const API_KEY = '466892663265132';
const API_SECRET = 'rj4H664LjfZTX3FVLt6GLqxF-N8';

// Generates Cloudinary signature for secure uploads
function generateSignature(params: Record<string, string>): string {
    const sortedKeys = Object.keys(params).sort();
    const signatureString = sortedKeys
        .map((key) => `${key}=${params[key]}`)
        .join('&') + API_SECRET;
    return crypto.createHash('sha1').update(signatureString).digest('hex');
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const folder = (formData.get('folder') as string) || 'pdfbullet';
        const timestamp = Math.round(Date.now() / 1000).toString();

        const signParams: Record<string, string> = {
            folder,
            timestamp,
        };

        const signature = generateSignature(signParams);

        // Build multipart upload to Cloudinary
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('api_key', API_KEY);
        uploadFormData.append('timestamp', timestamp);
        uploadFormData.append('signature', signature);
        uploadFormData.append('folder', folder);

        const resourceType = file.type.startsWith('video/') ? 'video' : 
                             file.type === 'application/pdf' ? 'raw' : 'image';

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

        const cloudinaryRes = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: uploadFormData,
        });

        if (!cloudinaryRes.ok) {
            const errorBody = await cloudinaryRes.text();
            console.error('Cloudinary error:', errorBody);
            return NextResponse.json({ error: 'Cloudinary upload failed', details: errorBody }, { status: 500 });
        }

        const cloudinaryData = await cloudinaryRes.json();

        return NextResponse.json({
            success: true,
            url: cloudinaryData.secure_url,
            publicId: cloudinaryData.public_id,
            format: cloudinaryData.format,
            width: cloudinaryData.width,
            height: cloudinaryData.height,
            bytes: cloudinaryData.bytes,
            resourceType: cloudinaryData.resource_type,
        });
    } catch (error: any) {
        console.error('Upload route error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
