import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'site_content.json');

// Default site content structure - all editable homepage sections & other pages
const DEFAULT_CONTENT = {
    // HOMEPAGE SECTIONS
    hero: {
        badge: "🚀 Trusted by 2M+ Professionals Worldwide",
        headline: "The Only PDF Suite\nYou'll Ever Need",
        subheadline: "Convert, compress, merge, split, sign, and transform PDFs with enterprise-grade precision — completely free, with no file size limits.",
        ctaPrimary: "Start Converting Free",
        ctaSecondary: "View All 40+ Tools",
        statsLabel: "No account required · Instant results · Bank-level security"
    },
    advantage: {
        sectionBadge: "Why PDFBullet?",
        headline: "The PDFBullet Advantage",
        subheadline: "We didn't just build another PDF tool. We built the PDF operating system — engineered for the real world.",
        features: [
            { icon: "🔒", title: "Bank-Level Security", description: "All files processed with AES-256 encryption. Zero retention policy — your files are deleted immediately after processing." },
            { icon: "⚡", title: "Lightning Fast", description: "Powered by optimized cloud infrastructure with edge processing. Convert 100-page documents in under 3 seconds." },
            { icon: "🎯", title: "Pixel-Perfect Results", description: "Native format support ensures your fonts, layouts, and images are preserved with 100% fidelity every single time." },
            { icon: "🌐", title: "Works Everywhere", description: "Browser-based with offline PWA support. Works on Windows, Mac, iOS, Android — no installation required." },
            { icon: "🔄", title: "Batch Processing", description: "Premium users can process hundreds of files simultaneously with our intelligent queue management system." },
            { icon: "🤖", title: "AI-Enhanced Tools", description: "Smart OCR, CV enhancement, and document intelligence powered by the latest AI models — all included." }
        ]
    },
    guide: {
        sectionBadge: "Simple Process",
        headline: "3 Steps to Perfect PDFs",
        subheadline: "No learning curve. No tutorials needed. Upload, process, download — it's that simple.",
        steps: [
            { step: "01", title: "Upload Your File", description: "Drag & drop or click to upload. Supports PDF, Word, Excel, PowerPoint, JPG, PNG, and 30+ formats. Up to 100MB free." },
            { step: "02", title: "Choose Your Tool", description: "Select from 40+ precision tools. Convert, compress, merge, split, protect, sign, watermark, and more." },
            { step: "03", title: "Download Instantly", description: "Your processed file is ready in seconds. Download directly or save to cloud. No watermarks, no quality loss." }
        ]
    },
    impact: {
        sectionBadge: "Real Numbers",
        headline: "Our Impact in Numbers",
        subheadline: "Real data from real users who trust PDFBullet every day.",
        stats: [
            { value: "50M+", label: "Files Processed", description: "Every month, millions of documents processed" },
            { value: "2.1M+", label: "Active Users", description: "Professionals across 195 countries" },
            { value: "40+", label: "PDF Tools", description: "The most comprehensive free PDF toolkit" },
            { value: "99.9%", label: "Uptime SLA", description: "Enterprise-grade reliability guaranteed" },
            { value: "< 3s", label: "Avg. Processing", description: "Lightning-fast conversion engine" },
            { value: "4.9★", label: "User Rating", description: "Based on 50,000+ verified reviews" }
        ]
    },
    ecosystem: {
        sectionBadge: "Cross-Platform",
        headline: "Beyond the Browser",
        subheadline: "PDFBullet goes wherever you go. Install our PWA for a native app experience on any device.",
        platforms: [
            { icon: "🍎", name: "iOS", description: "Add to Home Screen from Safari" },
            { icon: "🤖", name: "Android", description: "Install from Chrome browser" },
            { icon: "🖥️", name: "Windows", description: "Pin from Edge or Chrome" },
            { icon: "🍏", name: "macOS", description: "Add from Safari or Chrome" }
        ],
        ctaText: "Install Free PWA App"
    },
    testimonials: {
        sectionBadge: "Customer Love",
        headline: "Trusted by Professionals Worldwide",
        subheadline: "Don't take our word for it. See what professionals across industries say about PDFBullet.",
        items: [
            { name: "Sarah Mitchell", role: "Senior Legal Counsel", company: "Morrison & Foerster LLP", rating: 5, review: "PDFBullet has completely transformed our document workflow. The PDF merging and splitting tools are flawless, and the security features meet our firm's strict compliance standards. We process hundreds of legal documents daily.", avatar: "" },
            { name: "Dr. James Chen", role: "Research Director", company: "Stanford Medical Center", rating: 5, review: "The OCR capability is exceptional. We digitize thousands of patient records and research papers monthly. The accuracy is remarkable — far better than anything else we've tried at any price point.", avatar: "" },
            { name: "Maria Santos", role: "Creative Director", company: "Publicis Groupe", rating: 5, review: "Finally, a PDF tool that respects design! Our layouts and typography remain pixel-perfect after conversion. The image compression is smart — quality stays intact while file sizes drop dramatically.", avatar: "" },
            { name: "Alex Thompson", role: "Startup Founder", company: "TechVentures Inc.", rating: 5, review: "Switched from expensive enterprise software and never looked back. PDFBullet handles everything from investor decks to contracts. The batch processing saves our team 3+ hours every single week.", avatar: "" },
            { name: "Priya Sharma", role: "Education Coordinator", company: "UNESCO", rating: 5, review: "We distribute educational materials across 50+ countries in multiple formats. PDFBullet's conversion accuracy and multi-language support has been invaluable for our global mission.", avatar: "" },
            { name: "Michael O'Brien", role: "Financial Analyst", company: "Goldman Sachs", rating: 5, review: "The Excel-to-PDF conversion preserves complex financial models perfectly. Charts, conditional formatting, and multi-sheet workbooks — everything looks exactly as intended. A must-have tool.", avatar: "" }
        ]
    },
    premium: {
        sectionBadge: "Go Premium",
        headline: "Supercharge Your Workflow",
        subheadline: "Unlock the full power of PDFBullet with Premium — more speed, more files, more AI.",
        features: [
            "Unlimited file size (up to 2GB)",
            "Batch process up to 500 files",
            "Priority processing queue",
            "Advanced AI OCR & enhancement",
            "API access (10,000 calls/month)",
            "Custom watermark & branding",
            "Dedicated support team",
            "Commercial use license"
        ],
        ctaText: "Upgrade to Premium",
        ctaUrl: "/pricing"
    },
    faq: {
        sectionBadge: "Got Questions?",
        headline: "Frequently Asked Questions",
        items: [
            { q: "Is PDFBullet really free?", a: "Yes! Core tools including PDF conversion, compression, merge, and split are completely free with no file size limits on single files. Premium plans unlock batch processing, larger file limits, API access, and priority support." },
            { q: "How secure are my files?", a: "Extremely secure. All uploads use HTTPS/TLS encryption. Files are processed on isolated servers and permanently deleted within 1 hour of processing. We never store, share, or analyze your document content." },
            { q: "Do I need to create an account?", a: "No account required for most tools! Create a free account to save your conversion history, access favorites, and unlock additional features. Premium subscriptions require an account." },
            { q: "What file formats are supported?", a: "PDFBullet supports 50+ formats including PDF, Word (DOC, DOCX), Excel (XLS, XLSX), PowerPoint (PPT, PPTX), images (JPG, PNG, WEBP, TIFF), and more. See our full list on the tools page." },
            { q: "Is there an API available?", a: "Yes! Our REST API provides programmatic access to all conversion tools. Free tier includes 50 API calls/month. Developer and Business plans offer up to 100,000 calls/month with priority processing." },
            { q: "Can I use PDFBullet for commercial projects?", a: "Free tier is available for personal use. Commercial use requires a Premium subscription. Business and Enterprise plans include commercial licensing for agencies, SaaS products, and high-volume use cases." }
        ]
    },
    blogSection: {
        sectionBadge: "Knowledge Hub",
        headline: "Our Latest Articles",
        subheadline: "Tips, tutorials, and insights to help you master document workflows.",
        ctaText: "View All Articles"
    },
    trustpilot: {
        headline: "Love PDFBullet?",
        subheadline: "Share your experience and help others discover the best PDF tool.",
        ctaText: "Review Us on Trustpilot",
        ctaUrl: "https://trustpilot.com"
    },

    // ADDITIONAL PAGES
    aboutPage: {
        heroHeadline: "Our Mission: To Make Document Management Simple, Secure, and Accessible for Everyone",
        heroSubheadline: "At PDF Bullet, we are building a world where document management is no longer a barrier to productivity.",
        ourStoryTitle: "Our Story",
        ourStoryContent1: "PDF Bullet was founded in 2025 with a clear objective: to solve the everyday frustrations of dealing with PDF files. We saw a need for a reliable, accessible, and high-performance online platform that didn't compromise on user privacy or experience. Traditional PDF software was often clunky, expensive, and required installation, creating unnecessary friction for simple tasks.",
        ourStoryContent2: "We started with a handful of core tools—Merge, Split, and Compress—built on the principle of client-side processing to guarantee user privacy. The response was overwhelmingly positive. This initial success fueled our ambition to create a truly all-in-one solution.",
        ourStoryContent3: "Today, PDF Bullet has grown into a comprehensive toolkit trusted by thousands of users daily, driven by continuous innovation and a commitment to our community. We believe that powerful technology should be available to everyone, and we work tirelessly to ensure our tools are both advanced and easy to use.",
        technologyTitle: "Our Technology",
        technologyContent1: "What truly sets PDF Bullet apart is our foundational commitment to a browser-first, privacy-centric architecture. Unlike many other online services, the vast majority of our tools process your files directly on your own device.",
        technologyContent2: "Client-Side Processing: By harnessing the power of modern web browsers and technologies like WebAssembly, we perform complex operations like merging, compressing, and editing without your files ever leaving your computer.",
        technologyContent3: "Secure Server-Side Tasks: For select tools that require intensive computational power beyond the browser's capabilities (like advanced OCR or certain conversions), we utilize a secure, encrypted connection for temporary file handling. Even then, your files are automatically deleted."
    },
    pricingPage: {
        heroHeadline: "Simple, Transparent Pricing",
        heroSubheadline: "Start free. Upgrade when you need more power.",
        badgeText: "14-Day Free Trial on All Plans",
        faqTitle: "Pricing FAQ",
        faqSubtitle: "Got questions about our plans? We've got answers.",
        ctaTitle: "Ready to unlock the full power of PDFBullet?",
        ctaSubtitle: "Join millions of users who get more done with our PDF toolkit."
    },
    contactPage: {
        heroHeadline: "Get in Touch",
        heroSubheadline: "Have a question, feedback, or need support? We'd love to hear from you.",
        emailTitle: "Email Us",
        emailValue: "support@pdfbullet.com",
        whatsappTitle: "WhatsApp Support",
        whatsappValue: "+977-9800000000",
        addressTitle: "Office Address",
        addressValue: "Kathmandu, Nepal",
        formTitle: "Send Us a Message",
        responseTimeText: "We typically respond within 24 hours."
    },
    featuresPage: {
        heroHeadline: "Everything You Need to Work with PDFs",
        heroSubheadline: "Discover the features that make PDFBullet the easiest and most powerful PDF tool in the world."
    },
    securityPage: {
        heroHeadline: "Your Security is Our Priority",
        heroSubheadline: "Every decision we make starts with one question: is this safe for our users?",
        introTitle: "Enterprise-grade protection, browser-based speed",
        introBody: "We design all our workflows to minimize data collection and processing. Your documents are your business."
    },
    faqPage: {
        heroHeadline: "Help Center & FAQ",
        heroSubheadline: "Find answers to common questions about PDFBullet."
    },
    pressPage: {
        heroHeadline: "PDFBullet in the News",
        heroSubheadline: "Download our press kit or contact us for media inquiries.",
        pressEmail: "press@pdfbullet.com"
    },
    educationPage: {
        heroHeadline: "Empowering Education Through Better Document Management",
        heroSubheadline: "Free PDF tools designed for students, teachers, and institutions.",
        ctaTitle: "Free for Students and Educators",
        ctaText: "All core tools are 100% free. No credit card required."
    },
    businessPage: {
        heroHeadline: "PDF Solutions Built for Business",
        heroSubheadline: "From startups to enterprise. Scale your document workflow with PDFBullet."
    },
    developerPage: {
        heroHeadline: "Build with PDFBullet API",
        heroSubheadline: "Powerful PDF processing for your applications. Start free, scale as you grow."
    }
};

function ensureDataDir() {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function readContent() {
    ensureDataDir();
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_CONTENT, null, 2), 'utf-8');
        return DEFAULT_CONTENT;
    }
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const stored = JSON.parse(raw);
        return deepMerge(DEFAULT_CONTENT, stored);
    } catch {
        return DEFAULT_CONTENT;
    }
}

function deepMerge(defaults: any, overrides: any): any {
    const result = { ...defaults };
    for (const key of Object.keys(overrides)) {
        if (key in defaults && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
            result[key] = deepMerge(defaults[key], overrides[key]);
        } else {
            result[key] = overrides[key];
        }
    }
    return result;
}

export async function GET() {
    try {
        const content = readContent();
        return NextResponse.json(content);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        ensureDataDir();
        fs.writeFileSync(DATA_FILE, JSON.stringify(body, null, 2), 'utf-8');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        ensureDataDir();
        fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_CONTENT, null, 2), 'utf-8');
        return NextResponse.json({ success: true, message: 'Content reset to defaults' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
