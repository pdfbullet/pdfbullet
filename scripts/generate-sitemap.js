const fs = require("fs");
const path = require("path");

// Today's date
const today = new Date().toISOString().split("T")[0];

// List all pages with their changefreq and priority
const pages = [
  // Main Pages
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
  { loc: "/signup", changefreq: "monthly", priority: "0.9" },
  { loc: "/account-settings", changefreq: "monthly", priority: "0.8" },
  { loc: "/workflows", changefreq: "monthly", priority: "0.7" },
  { loc: "/security", changefreq: "monthly", priority: "0.7" },
  { loc: "/team", changefreq: "monthly", priority: "0.7" },
  { loc: "/last-tasks", changefreq: "weekly", priority: "0.7" },
  { loc: "/signatures-overview", changefreq: "weekly", priority: "0.7" },
  { loc: "/sent", changefreq: "weekly", priority: "0.7" },
  { loc: "/inbox", changefreq: "weekly", priority: "0.7" },
  { loc: "/signed", changefreq: "weekly", priority: "0.7" },
  { loc: "/templates", changefreq: "monthly", priority: "0.7" },
  { loc: "/contacts", changefreq: "monthly", priority: "0.7" },
  { loc: "/signature-settings", changefreq: "monthly", priority: "0.7" },
  { loc: "/plans-packages", changefreq: "monthly", priority: "0.7" },
  { loc: "/business-details", changefreq: "monthly", priority: "0.7" },
  { loc: "/invoices", changefreq: "monthly", priority: "0.7" },

  // Tool Pages
  { loc: "/merge-pdf", changefreq: "weekly", priority: "0.9" },
  { loc: "/split-pdf", changefreq: "weekly", priority: "0.9" },
  { loc: "/organize-pdf", changefreq: "weekly", priority: "0.8" },
  { loc: "/rotate-pdf", changefreq: "weekly", priority: "0.8" },
  { loc: "/zip-maker", changefreq: "weekly", priority: "0.7" },
  { loc: "/compress-pdf", changefreq: "weekly", priority: "0.9" },
  { loc: "/repair-pdf", changefreq: "weekly", priority: "0.7" },
  { loc: "/resize-file", changefreq: "weekly", priority: "0.7" },
  { loc: "/jpg-to-pdf", changefreq: "weekly", priority: "0.7" },
  { loc: "/psd-to-pdf", changefreq: "weekly", priority: "0.7" },
  { loc: "/word-to-pdf", changefreq: "weekly", priority: "0.7" },
  { loc: "/powerpoint-to-pdf", changefreq: "weekly", priority: "0.7" },
  { loc: "/excel-to-pdf", changefreq: "weekly", priority: "0.7" },
  { loc: "/html-to-pdf", changefreq: "weekly", priority: "0.7" },
  { loc: "/document-scanner", changefreq: "weekly", priority: "0.7" },
  { loc: "/pdf-to-jpg", changefreq: "weekly", priority: "0.7" },
  { loc: "/pdf-to-png", changefreq: "weekly", priority: "0.7" },
  { loc: "/pdf-to-word", changefreq: "weekly", priority: "0.7" },
  { loc: "/pdf-to-powerpoint", changefreq: "weekly", priority: "0.7" },
  { loc: "/pdf-to-excel", changefreq: "weekly", priority: "0.7" },
  { loc: "/pdf-to-pdfa", changefreq: "weekly", priority: "0.7" },
  { loc: "/extract-text", changefreq: "weekly", priority: "0.7" },
  { loc: "/edit-pdf", changefreq: "weekly", priority: "0.7" },
  { loc: "/page-numbers", changefreq: "weekly", priority: "0.7" },
  { loc: "/crop-pdf", changefreq: "weekly", priority: "0.7" },
  { loc: "/ocr-pdf", changefreq: "weekly", priority: "0.7" },
  { loc: "/compare-pdf", changefreq: "weekly", priority: "0.7" },
  { loc: "/redact-pdf", changefreq: "weekly", priority: "0.7" },
  { loc: "/ai-question-generator", changefreq: "weekly", priority: "0.7" },
  { loc: "/invoice-generator", changefreq: "weekly", priority: "0.7" },
  { loc: "/cv-generator", changefreq: "weekly", priority: "0.7" },
  { loc: "/lesson-plan-creator", changefreq: "weekly", priority: "0.7" },
  { loc: "/unlock-pdf", changefreq: "weekly", priority: "0.7" },
  { loc: "/protect-pdf", changefreq: "weekly", priority: "0.7" },
  { loc: "/sign-pdf", changefreq: "weekly", priority: "0.7" },
  { loc: "/watermark-pdf", changefreq: "weekly", priority: "0.7" },
  { loc: "/resize-image", changefreq: "weekly", priority: "0.7" },
  { loc: "/remove-background", changefreq: "weekly", priority: "0.7" },
  { loc: "/crop-image", changefreq: "weekly", priority: "0.7" },
  { loc: "/convert-to-jpg", changefreq: "weekly", priority: "0.7" },
  { loc: "/convert-from-jpg", changefreq: "weekly", priority: "0.7" },
  { loc: "/compress-image", changefreq: "weekly", priority: "0.7" },
  { loc: "/watermark-image", changefreq: "weekly", priority: "0.7" },

  // Blog Pages
  { loc: "/blog/nepal-bans-facebook-social-media", changefreq: "weekly", priority: "0.7" },
  { loc: "/blog/neb-class-12-result-2081-2082", changefreq: "weekly", priority: "0.7" },
  { loc: "/blog/build-a-professional-cv-in-minutes-with-ai", changefreq: "weekly", priority: "0.7" },
  { loc: "/blog/ai-lesson-plan-creator-for-teachers", changefreq: "weekly", priority: "0.7" },
  { loc: "/blog/turn-any-text-into-a-quiz-ai-question-generator", changefreq: "weekly", priority: "0.7" },
  { loc: "/blog/you-can-now-edit-images-in-pdfbullet", changefreq: "weekly", priority: "0.7" },
  { loc: "/blog/the-best-free-graphic-design-software-2025", changefreq: "weekly", priority: "0.7" },
  { loc: "/blog/how-to-convert-html-to-pdf", changefreq: "weekly", priority: "0.7" },
  { loc: "/blog/how-to-add-password-to-pdf", changefreq: "weekly", priority: "0.7" },
  { loc: "/blog/are-digital-signatures-legally-binding", changefreq: "weekly", priority: "0.7" },
  { loc: "/blog/smart-ocr-tips-get-most-out-of-scanned-documents", changefreq: "weekly", priority: "0.7" },
  { loc: "/blog/how-to-edit-pdf-text-online", changefreq: "weekly", priority: "0.7" },
  { loc: "/blog/pdfbullet-web-vs-desktop-vs-mobile-which-is-for-you", changefreq: "weekly", priority: "0.7" },
  { loc: "/blog/introducing-pdfbullet-chatgpt-custom-pdf-gpt", changefreq: "weekly", priority: "0.7" },
  { loc: "/blog/see-result-2081-2082", changefreq: "weekly", priority: "0.7" }
];

// Build sitemap XML
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n`;

pages.forEach(page => {
  xml += `  <url>\n`;
  xml += `    <loc>https://pdfbullet.com${page.loc}</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
  xml += `    <priority>${page.priority}</priority>\n`;
  xml += `  </url>\n`;
});

xml += `\n</urlset>`;

// Write to sitemap.xml
fs.writeFileSync(path.join(__dirname, "sitemap.xml"), xml);

console.log("✅ sitemap.xml generated successfully!");
