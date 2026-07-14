const fs = require("fs");
const path = require("path");

// Today's date
const today = new Date().toISOString().split("T")[0];

// Main static pages (guaranteed pages)
const staticPages = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/about", changefreq: "monthly", priority: "0.8" },
  { loc: "/blog", changefreq: "weekly", priority: "0.9" },
  { loc: "/contact", changefreq: "monthly", priority: "0.7" },
  { loc: "/faq", changefreq: "monthly", priority: "0.7" },
  { loc: "/sitemap", changefreq: "monthly", priority: "0.6" },
  { loc: "/pricing", changefreq: "monthly", priority: "0.8" },
  { loc: "/premium-feature", changefreq: "monthly", priority: "0.7" },
  { loc: "/how-to-use", changefreq: "monthly", priority: "0.7" },
  { loc: "/education", changefreq: "monthly", priority: "0.7" },
  { loc: "/business", changefreq: "monthly", priority: "0.7" },
  { loc: "/ceo", changefreq: "yearly", priority: "0.5" },
  { loc: "/press", changefreq: "yearly", priority: "0.5" },
  { loc: "/features", changefreq: "monthly", priority: "0.8" },
  { loc: "/user-data-deletion", changefreq: "yearly", priority: "0.5" },
  
  // Legal Pages
  { loc: "/legal", changefreq: "yearly", priority: "0.5" },
  { loc: "/privacy-policy", changefreq: "yearly", priority: "0.5" },
  { loc: "/terms-of-service", changefreq: "yearly", priority: "0.5" },
  { loc: "/cookies-policy", changefreq: "yearly", priority: "0.5" },
  { loc: "/security-policy", changefreq: "yearly", priority: "0.5" },
  
  // Developer & API Pages
  { loc: "/developer", changefreq: "monthly", priority: "0.7" },
  { loc: "/api-pricing", changefreq: "monthly", priority: "0.7" },
  { loc: "/api-reference", changefreq: "monthly", priority: "0.7" },
  { loc: "/api-pdf", changefreq: "weekly", priority: "0.8" },
  { loc: "/api-image", changefreq: "weekly", priority: "0.8" },
  { loc: "/api-signature", changefreq: "weekly", priority: "0.8" },
  
  // Auth & Account Pages
  { loc: "/login", changefreq: "monthly", priority: "0.9" },
  { loc: "/signup", changefreq: "monthly", priority: "0.9" }
];

// Let's dynamically read tools and blogs from constants.ts!
const constantsPath = path.resolve(process.cwd(), 'constants.ts');
let dynamicPages = [];

try {
  let constantsContent = fs.readFileSync(constantsPath, 'utf8');
  // Handle UTF-16 if present
  if (constantsContent.includes('\u0000')) {
    constantsContent = fs.readFileSync(constantsPath, 'utf16le');
  }

  // 1. Extract tools
  // Tools are defined in the TOOLS array, look for id: '...' or id: "..."
  const toolMatches = constantsContent.matchAll(/id:\s*['"]([^'"]+)['"]/g);
  const toolIds = [];
  for (const match of toolMatches) {
    if (match[1] && !toolIds.includes(match[1]) && !['merge-pdf', 'split-pdf'].includes(match[1]) && match[1] !== 'premium-feature') {
      toolIds.push(match[1]);
    }
  }
  
  // Core tools fallback to ensure they exist regardless of regex
  const coreTools = [
    'merge-pdf', 'split-pdf', 'organize-pdf', 'rotate-pdf', 'zip-maker', 
    'compress-pdf', 'repair-pdf', 'jpg-to-pdf', 'psd-to-pdf', 'word-to-pdf', 
    'powerpoint-to-pdf', 'excel-to-pdf', 'pdf-to-jpg', 'pdf-to-png', 
    'pdf-to-word', 'pdf-to-excel', 'pdf-to-powerpoint', 'pdf-reader', 
    'ocr-pdf', 'ai-image-generator', 'ai-question-generator', 'invoice-generator', 
    'cv-generator', 'lesson-plan-creator', 'unlock-pdf', 'protect-pdf', 
    'sign-pdf', 'watermark-pdf', 'remove-background'
  ];
  
  const allTools = [...new Set([...coreTools, ...toolIds])];
  allTools.forEach(toolId => {
    dynamicPages.push({ loc: `/${toolId}`, changefreq: 'weekly', priority: '0.8' });
  });

  // 2. Extract blog posts
  // Look for slug: '...' or slug: "..."
  const blogMatches = constantsContent.matchAll(/slug:\s*['"]([^'"]+)['"]/g);
  const blogSlugs = [];
  for (const match of blogMatches) {
    if (match[1] && !blogSlugs.includes(match[1]) && !['admin-dashboard', 'dashboard/my-flipbooks'].includes(match[1])) {
      blogSlugs.push(match[1]);
    }
  }
  
  const coreBlogs = [
    'nepal-bans-facebook-social-media', 'neb-class-12-result-2081-2082', 
    'build-a-professional-cv-in-minutes-with-ai', 'ai-lesson-plan-creator-for-teachers', 
    'turn-any-text-into-a-quiz-ai-question-generator', 'you-can-now-edit-images-in-pdfbullet', 
    'the-best-free-graphic-design-software-2025', 'how-to-convert-html-to-pdf', 
    'how-to-add-password-to-pdf', 'are-digital-signatures-legally-binding', 
    'smart-ocr-tips-get-most-out-of-scanned-documents', 'how-to-edit-pdf-text-online', 
    'pdfbullet-web-vs-desktop-vs-mobile-which-is-for-you', 
    'introducing-pdfbullet-chatgpt-custom-pdf-gpt', 'see-result-2081-2082'
  ];

  const allBlogs = [...new Set([...coreBlogs, ...blogSlugs])];
  allBlogs.forEach(slug => {
    dynamicPages.push({ loc: `/blog/${slug}`, changefreq: 'weekly', priority: '0.7' });
  });

} catch (err) {
  console.error("Could not parse constants.ts for dynamic paths, using static fallbacks.", err);
}

const allPages = [...staticPages, ...dynamicPages];

// Build sitemap XML
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n`;

allPages.forEach(page => {
  xml += `  <url>\n`;
  xml += `    <loc>https://pdfbullet.com${page.loc}</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
  xml += `    <priority>${page.priority}</priority>\n`;
  xml += `  </url>\n`;
});

xml += `\n</urlset>`;

// Write directly to public/sitemap.xml
const publicPath = path.resolve(process.cwd(), 'public/sitemap.xml');
fs.writeFileSync(publicPath, xml);
console.log(`✅ sitemap.xml generated successfully! Total pages: ${allPages.length}`);
