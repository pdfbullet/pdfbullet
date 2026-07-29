import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { jsPDF } from 'jspdf';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, apiKey } = body;

        if (!email || !apiKey) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate PDF
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(0, 128, 128); // Teal color
        doc.text("PDFBullet Developer API Guide", 20, 30);
        
        doc.setFontSize(14);
        doc.setTextColor(50, 50, 50);
        doc.text("Welcome to the official PDFBullet API!", 20, 50);
        
        doc.setFontSize(12);
        doc.text("Your Official API Key:", 20, 70);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 38, 38); // Red
        doc.text(apiKey, 20, 80);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        doc.text("Keep this key secure. Do not expose it in client-side code.", 20, 95);

        doc.setFontSize(16);
        doc.setTextColor(0, 128, 128);
        doc.text("Quick Start: cURL Example", 20, 120);

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const curlSnippet = `
curl -X POST https://pdfbullet.com/api/convert-word \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@/path/to/document.docx" \\
  --output output.pdf
`;
        doc.text(curlSnippet.trim(), 20, 130);

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text("For full documentation, visit: https://pdfbullet.com/docs", 20, 170);

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        // HTML Email Template
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 0; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                .header { background-color: #0d3b36; padding: 32px 40px; text-align: center; }
                .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
                .content { padding: 40px; color: #374151; line-height: 1.6; }
                .api-key-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center; }
                .api-key { font-family: monospace; font-size: 16px; color: #dc2626; font-weight: bold; word-break: break-all; }
                .warning { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; font-size: 14px; color: #92400e; }
                .footer { background-color: #f3f4f6; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb; }
                .socials a { display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none; font-weight: 600; font-size: 14px; }
                .socials a:hover { color: #111827; }
                .btn { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 16px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>PDFBullet Developer API</h1>
                </div>
                <div class="content">
                    <p>Hi there,</p>
                    <p>Welcome to the official PDFBullet API! Your Developer API Key has been successfully generated and is ready for immediate use across all our conversion and document processing endpoints.</p>
                    
                    <div class="api-key-box">
                        <p style="margin-top: 0; font-size: 12px; color: #991b1b; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Your Live API Key</p>
                        <span class="api-key">${apiKey}</span>
                    </div>

                    <div class="warning">
                        <strong>Security Warning:</strong> Please treat this API key like a password. Do not share it, commit it to version control (like GitHub), or expose it in client-side code (e.g. React/Browser JS). Always proxy requests through your secure backend.
                    </div>

                    <p>We've attached a comprehensive <strong>PDF Integration Guide</strong> to this email to help you get started within minutes using cURL, Node.js, Python, PHP, or Go.</p>
                    
                    <center>
                        <a href="https://pdfbullet.com/docs" class="btn">View Full API Reference</a>
                    </center>
                </div>
                <div class="footer">
                    <div class="socials">
                        <a href="https://www.facebook.com/share/16sdjGNVGr/?mibextid=wwXIfr">Facebook</a>
                        <a href="https://wa.me/message/JYA22CVSYSZ4N1">WhatsApp</a>
                        <a href="https://www.youtube.com/@btmobilecare">YouTube</a>
                    </div>
                    <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">
                        &copy; ${new Date().getFullYear()} PDFBullet. All rights reserved.<br>
                        You received this email because you generated an API Key.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;

        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            await transporter.sendMail({
                from: `"PDFBullet Developers" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
                to: email,
                subject: 'Your PDFBullet API Key & Official Guide',
                html: htmlContent,
                attachments: [
                    {
                        filename: 'PDFBullet_API_Guide.pdf',
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }
                ]
            });
            console.log(`✅ Sent welcome email to ${email}`);
        } else {
            console.log('⚠️ No SMTP configuration found in environment variables. Email was generated but not sent.');
            console.log(`Generated API Key for ${email}: ${apiKey}`);
        }

        return NextResponse.json({ success: true, message: 'Email processed successfully' });
    } catch (e: any) {
        console.error('Welcome Email Error:', e);
        return NextResponse.json({ error: 'Failed to process welcome email' }, { status: 500 });
    }
}
