import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAuthenticatedUser } from '../../../../utils/apiAuth';

const FILE_PATH = path.join(process.cwd(), 'page_seo.json');

const defaultSeo = [
  { path: '/', title: 'Pdf Bullet | Free PDF & Image Tools for Document Management', description: 'Merge, split, compress, convert, rotate, protect, and e-sign PDFs online with PDFBullet.' },
  { path: '/tools', title: 'All PDF Tools | PDFBullet', description: 'Browse all available PDF, image, business, and educational utilities.' },
  { path: '/storage', title: 'Device & Cloud Storage | PDFBullet', description: 'Access your document files from local devices or integrated cloud services.' },
  { path: '/settings', title: 'Preferences & Settings | PDFBullet', description: 'Configure application settings, theme, security options, and layout preferences.' },
  { path: '/notifications', title: 'Notifications & Alerts | PDFBullet', description: 'Stay updated with global announcements and PWA system notification history.' },
  { path: '/developer-access', title: 'Developer Portal Authorization | PDFBullet', description: 'Authorize administrator dashboard credentials.' },
  { path: '/admin-dashboard', title: 'Admin Central Console | PDFBullet', description: 'Manage users, view problem reports, examine logs, audit feedback, and customize configuration.' },
  { path: '/pricing', title: 'Pricing & Packages | PDFBullet', description: 'Upgrade your subscription plan to unlock professional document conversion pipelines.' },
  { path: '/developer', title: 'API Integration Hub | PDFBullet', description: 'Secure API token generation and detailed backend endpoint integration reference.' },
  { path: '/about', title: 'Our Mission & Story | PDFBullet', description: 'Learn about the core values driving the development of PDFBullet.' },
  { path: '/contact', title: 'Contact Support Center | PDFBullet', description: 'Submit technical inquiries or get in touch with the product support team.' },
  { path: '/faq', title: 'Frequently Asked Questions | PDFBullet', description: 'Find quick answers to common questions regarding document processing security.' },
  { path: '/features', title: 'Premium Features List | PDFBullet', description: 'Discover the advanced tools and converters available to premium subscribers.' },
  { path: '/how-to-use', title: 'User Guides & Tutorials | PDFBullet', description: 'Step-by-step guides on how to make the most of our conversion engines.' },
  { path: '/business', title: 'PDF Solutions for Business | PDFBullet', description: 'Enterprise-grade security, custom workflows, and team accounts.' },
  { path: '/education', title: 'PDF Utilities for Education | PDFBullet', description: 'Specialized generation engines tailored for teachers, students, and educators.' },
  { path: '/press', title: 'Press & Media Kits | PDFBullet', description: 'Read official announcements, logos, brand guidelines, and media resource folders.' },
  { path: '/ceo', title: 'Executive Statement | PDFBullet', description: 'A personal message from the CEO on the future roadmap of PDFBullet.' },
  { path: '/legal', title: 'Legal & Regulatory Compliance | PDFBullet', description: 'Access standard policies, terms of service agreements, and cookie details.' },
  { path: '/privacy-policy', title: 'Privacy Policy | PDFBullet', description: 'Understand how we protect your uploaded files and personal profile details.' },
  { path: '/terms-of-service', title: 'Terms of Service | PDFBullet', description: 'Read the terms, rules, and conditions governing the usage of PDFBullet.' },
  { path: '/cookies-policy', title: 'Cookies & Tracker Policy | PDFBullet', description: 'Information about functional cookies and user analytics tracking systems.' },
  { path: '/security-policy', title: 'Document Security Standards | PDFBullet', description: 'Detailed explanation of document encryption, local sandbox, and secure transit.' },
  { path: '/submit-ticket', title: 'Submit Technical Incident Ticket | PDFBullet', description: 'File problem reports directly to our engineering team.' },
  { path: '/ai-image-generator', title: 'AI Image Synthesis Tool | PDFBullet', description: 'Generate stunning graphical designs from pure descriptive text prompts.' },
  { path: '/ai-question-generator', title: 'AI Exam & Question Builder | PDFBullet', description: 'Generate quizzes, questions, and test material automatically.' },
  { path: '/invoice-generator', title: 'Professional Billing Generator | PDFBullet', description: 'Build and style premium invoicing documents for clients instantly.' },
  { path: '/cv-generator', title: 'Professional Resume & CV Builder | PDFBullet', description: 'Export highly tailored CV resumes compliant with modern ATS filters.' },
  { path: '/lesson-plan-creator', title: 'AI Curriculum Lesson Plan Creator | PDFBullet', description: 'Draft comprehensive teaching curricula and lecture guides in seconds.' },
  
  // Standard PDF tools
  { path: '/merge-pdf', title: 'Merge PDF Online | PDFBullet', description: 'Combine multiple PDF files into a single document in custom order.' },
  { path: '/split-pdf', title: 'Split PDF Online | PDFBullet', description: 'Extract specific pages or split a PDF into separate files.' },
  { path: '/organize-pdf', title: 'Organize PDF Pages | PDFBullet', description: 'Delete, reorder, or rotate pages in a PDF document visually.' },
  { path: '/compress-pdf', title: 'Compress PDF Online | PDFBullet', description: 'Reduce PDF file size while maintaining maximum layout rendering quality.' },
  { path: '/repair-pdf', title: 'Repair Damaged PDF | PDFBullet', description: 'Recover contents from corrupted or unreadable PDF files.' },
  { path: '/ocr-pdf', title: 'OCR Scan PDF | PDFBullet', description: 'Recognize and convert scanned PDF images to fully selectable text.' },
  { path: '/jpg-to-pdf', title: 'Convert JPG to PDF | PDFBullet', description: 'Turn individual pictures or photo albums into custom PDF books.' },
  { path: '/word-to-pdf', title: 'Convert Word to PDF | PDFBullet', description: 'Convert Docx or Doc files to PDF with precise alignment.' },
  { path: '/powerpoint-to-pdf', title: 'Convert PPT to PDF | PDFBullet', description: 'Turn PowerPoint presentation slides into readable PDF format.' },
  { path: '/excel-to-pdf', title: 'Convert Excel to PDF | PDFBullet', description: 'Export spreadsheet workbooks to clean, printable page PDFs.' },
  { path: '/pdf-to-word', title: 'Convert PDF to Word | PDFBullet', description: 'Extract and convert PDF files back to fully editable Word documents.' },
  { path: '/pdf-to-powerpoint', title: 'Convert PDF to PPT | PDFBullet', description: 'Translate PDF page formats into slide-deck presentation structures.' },
  { path: '/pdf-to-excel', title: 'Convert PDF to Excel | PDFBullet', description: 'Extract tabular matrix structures directly to editable Excel sheets.' },
  { path: '/rotate-pdf', title: 'Rotate PDF Pages | PDFBullet', description: 'Permanently rotate landscape pages to portrait alignment, or vice versa.' },
  { path: '/page-numbers', title: 'Add PDF Page Numbers | PDFBullet', description: 'Inject fully formatted page numbers into PDF header or footer zones.' },
  { path: '/watermark-pdf', title: 'Watermark PDF | PDFBullet', description: 'Stripe images or custom warning text overlays onto PDF documents.' },
  { path: '/edit-pdf', title: 'Edit PDF Online | PDFBullet', description: 'Draw, annotate, add text, shapes, or handwrite directly on PDFs.' },
  { path: '/unlock-pdf', title: 'Remove PDF Password Protection | PDFBullet', description: 'Unlock password protected documents to enable print, copy, or edit rights.' },
  { path: '/protect-pdf', title: 'Protect PDF Password | PDFBullet', description: 'Encrypt and lock sensitive files with high-level AES password keys.' },
  { path: '/sign-pdf', title: 'e-Sign PDF Online | PDFBullet', description: 'Draw, upload, or type standard signatures directly onto documents.' }
];

function readSeo(): typeof defaultSeo {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(defaultSeo, null, 2));
      return defaultSeo;
    }
    const data = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return defaultSeo;
  }
}

function writeSeo(seoData: typeof defaultSeo) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(seoData, null, 2));
}

export async function GET() {
  try {
    const seoData = readSeo();
    return NextResponse.json({ seo: seoData });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read SEO configuration' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Data must be an array of SEO objects' }, { status: 400 });
    }

    writeSeo(body);
    return NextResponse.json({ success: true, seo: body });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update SEO configuration' }, { status: 500 });
  }
}
