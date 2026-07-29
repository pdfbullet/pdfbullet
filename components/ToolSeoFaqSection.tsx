import React, { useState } from 'react';

interface ToolSeoFaqSectionProps {
  toolId: string;
  toolTitle: string;
}

interface FaqItem {
  q: string;
  a: string;
}

interface ToolSeoData {
  mainTitle: string;
  mainSubtitle: string;
  feature1Title: string;
  feature1Desc: string[];
  feature2Title: string;
  feature2Desc: string[];
  faqs: FaqItem[];
}

const SEO_DATA_MAP: Record<string, ToolSeoData> = {
  'jpg-to-pdf': {
    mainTitle: 'JPG & PNG Images to PDF Document Converter',
    mainSubtitle: 'Convert photos, screenshots, and scanned images into a single clean PDF document online with custom page layouts.',
    feature1Title: 'Photo to PDF Compilation',
    feature1Desc: [
      'Select multiple image files (JPG, PNG, WebP). Adjust margins, page orientation (portrait/landscape), and image scale. The tool compiles them instantly into a standard, print-ready PDF file.',
      'This is extremely helpful for digitizing receipts, collecting book page scans, submitting assignments, or organizing photo portfolios into a single shareable document.',
      'Each uploaded image is rendered as an individual page, maintaining its original aspect ratios and dimensions.'
    ],
    feature2Title: 'Page Alignment & Visual Margin Calibration',
    feature2Desc: [
      'Configure individual sheet sizes (A4, Letter) or stretch images to fit. Previews of all image pages allow you to drag and drop sheets to reorder the PDF structure before final compilation.',
      'You can configure page margins (no margin, thin margin, thick margin) to create professional documents ready for printing.',
      'The PDF is generated entirely in memory, eliminating wait times and providing an immediate local download.'
    ],
    faqs: [
      { q: 'Can I reorder images before saving the PDF?', a: 'Yes, you can drag and drop your uploaded images to reorder them before converting them to a PDF document.' },
      { q: 'Will my images lose quality during the PDF conversion?', a: 'No. PDFBullet preserves your original image resolution and color quality without applying lossy compression unless requested.' },
      { q: 'What types of image formats does the converter support?', a: 'Our tool supports JPG, JPEG, PNG, WebP, GIF, and BMP formats for conversion into PDF.' },
      { q: 'Is there a limit on the number of images I can combine?', a: 'You can combine as many images as you need into a single PDF document for free.' }
    ]
  },
  'merge-pdf': {
    mainTitle: 'Merge PDF Files Online - Combine PDFs into One Document',
    mainSubtitle: 'Combine multiple PDF documents into a single organized PDF file quickly and securely without installing any software.',
    feature1Title: 'Seamless PDF File Combination',
    feature1Desc: [
      'Upload as many PDF files as you like. Reorder them using drag-and-drop or sort alphabetically before merging.',
      'Ideal for combining reports, invoices, eBooks, legal filings, and school projects into one structured file.',
      'Maintains original formatting, embedded fonts, images, and vector graphics without altering page quality.'
    ],
    feature2Title: 'Browser-Based End-to-End Privacy',
    feature2Desc: [
      'All merging logic runs directly in your web browser or via secure encrypted server pipelines.',
      'Your documents are private, secure, and automatically deleted after processing.',
      'Fast performance with zero file size limits for standard user tasks.'
    ],
    faqs: [
      { q: 'How many PDF files can I merge at once?', a: 'You can merge multiple PDF files simultaneously with no artificial restrictions on file count.' },
      { q: 'Can I reorder the pages or files before merging?', a: 'Yes, simply drag and drop the file cards into your desired order before clicking the Merge button.' },
      { q: 'Is it safe to merge sensitive financial or legal documents?', a: 'Absolute privacy is guaranteed. PDFBullet uses encrypted local processing, ensuring your confidential documents remain strictly private.' },
      { q: 'Does merging PDFs reduce document resolution?', a: 'No, PDFBullet preserves 100% of the original document resolution, text sharpness, and embedded image quality.' }
    ]
  },
  'split-pdf': {
    mainTitle: 'Split PDF Online - Separate PDF Pages into Individual Files',
    mainSubtitle: 'Extract specific pages or split large PDF files into separate documents in seconds.',
    feature1Title: 'Flexible Page Extraction & Splitting',
    feature1Desc: [
      'Specify exact page ranges (e.g. 1-5, 8, 11-15) or split every single page into an individual PDF file.',
      'Extract unwanted pages or split multi-chapter eBooks into individual study modules.',
      'Instant download as a single ZIP archive or separate PDF files.'
    ],
    feature2Title: 'Precision Page Selection',
    feature2Desc: [
      'Visual page thumbnails allow you to preview pages before extracting.',
      'Zero quality degradation—text, vector graphics, and hyperlinks remain perfectly preserved.',
      'Fast client-side rendering for instant page separation.'
    ],
    faqs: [
      { q: 'Can I extract non-consecutive pages from a PDF?', a: 'Yes, you can enter custom page numbers like 1, 4, 7-10 to extract only the specific pages you need.' },
      { q: 'How do I download the split PDF files?', a: 'Once split, you can download all separated pages in a single convenient ZIP file or as individual PDFs.' },
      { q: 'Will the original PDF file be modified or deleted?', a: 'Your original file stays untouched on your device. We create new split PDF copies.' },
      { q: 'Can I split password-protected PDFs?', a: 'You can split protected PDFs by providing the authorized password during upload.' }
    ]
  },
  'compress-pdf': {
    mainTitle: 'Compress PDF Online - Reduce PDF File Size Free',
    mainSubtitle: 'Optimize and shrink large PDF documents for email attachments, web uploads, and storage saving.',
    feature1Title: 'Smart PDF Optimization Algorithm',
    feature1Desc: [
      'Select between Extreme, Recommended, and Less Compression levels to match your exact file size targets.',
      'Intelligently downsamples high-res images and strips unnecessary document metadata without blurring text.',
      'Reduces file sizes by up to 80% while retaining high visual clarity for reading and printing.'
    ],
    feature2Title: 'Fast Web & Email Compatibility',
    feature2Desc: [
      'Compressed PDFs load much faster over slow internet connections and bypass strict email attachment limits.',
      'Generates web-optimized PDF streams compatible with all PDF viewers and browsers.',
      'Zero installation needed—works on desktop, tablet, and mobile browsers.'
    ],
    faqs: [
      { q: 'Will compressing a PDF affect the text quality?', a: 'No, text remains crisp and vector-sharp. Only embedded raster images are optimized.' },
      { q: 'How much can I reduce my PDF file size?', a: 'File size reduction ranges from 30% to 80% depending on the images and graphics contained in the PDF.' },
      { q: 'Is there a file size limit for compressing PDFs?', a: 'PDFBullet allows you to compress large files efficiently right inside your web browser.' },
      { q: 'What compression level should I choose?', a: 'We recommend "Recommended Compression" for optimal balance between visual quality and small file size.' }
    ]
  },
  'word-to-pdf': {
    mainTitle: 'Convert Word to PDF Online - DOC & DOCX to PDF',
    mainSubtitle: 'Convert Microsoft Word documents to clean, professional PDF files with exact formatting preservation.',
    feature1Title: 'High-Fidelity Document Rendering',
    feature1Desc: [
      'Converts DOC and DOCX files to PDF with 100% preservation of fonts, tables, margins, header/footers, and images.',
      'Eliminates layout shifts so your document looks identical on every operating system and device.',
      'Native server-side rendering delivers original Microsoft Word print quality.'
    ],
    feature2Title: 'Fast Multi-Document Conversion',
    feature2Desc: [
      'Convert single or batch Word documents effortlessly in seconds.',
      'Perfect for resumes, business proposals, contracts, and academic papers.',
      'Instant download with automated security cleanup.'
    ],
    faqs: [
      { q: 'Will my formatting change when converting Word to PDF?', a: 'No! PDFBullet uses native rendering to preserve exact fonts, margins, tables, and spacing.' },
      { q: 'Can I convert DOCX and older DOC files?', a: 'Yes, both modern .docx and legacy .doc formats are fully supported.' },
      { q: 'Do I need Microsoft Word installed on my computer?', a: 'No software or Word installation is needed. Everything is handled online.' },
      { q: 'Can I edit the PDF after converting from Word?', a: 'Yes, you can use our Edit PDF tool to add annotations or text after conversion.' }
    ]
  },
  'powerpoint-to-pdf': {
    mainTitle: 'Convert PowerPoint to PDF Online - PPTX & PPT to PDF',
    mainSubtitle: 'Turn Microsoft PowerPoint presentations into easy-to-share PDF slideshow documents.',
    feature1Title: 'Presentation Slide Preservation',
    feature1Desc: [
      'Converts PPT and PPTX presentations into high-resolution PDF slides suitable for presenting and printing.',
      'Locks in layout graphics, custom fonts, chart vectors, and slide dimensions.',
      'Protects your presentation from unauthorized slide modifications.'
    ],
    feature2Title: 'Compact Slide Deck Distribution',
    feature2Desc: [
      'Reduces presentation file sizes so slide decks can be easily emailed to clients or students.',
      'Compatible with mobile PDF viewers and smart displays.',
      'Safe, encrypted file handling with immediate cleanup.'
    ],
    faqs: [
      { q: 'Will slide graphics and charts convert accurately?', a: 'Yes, all vector charts, shapes, and slide elements are converted with high precision.' },
      { q: 'Can I convert PPT and PPTX formats?', a: 'Both .ppt and .pptx presentation formats are fully supported.' },
      { q: 'Are animations included in the PDF?', a: 'PDFs are static document formats, so slides are rendered in their final complete visual layout.' },
      { q: 'Is PowerPoint to PDF conversion free?', a: 'Yes, 100% free with no hidden charges or required software downloads.' }
    ]
  },
  'excel-to-pdf': {
    mainTitle: 'Convert Excel to PDF Online - XLS & XLSX to PDF',
    mainSubtitle: 'Transform Excel spreadsheets into neatly formatted, printable PDF documents.',
    feature1Title: 'Perfect Sheet Fit & Page Setup',
    feature1Desc: [
      'Automatically calibrates horizontal worksheet width so tables fit cleanly onto PDF pages without awkward splitting.',
      'Preserves cell borders, chart vectors, typography, and mathematical formulas as visual tables.',
      'Ideal for financial statements, payroll reports, invoices, and data sheets.'
    ],
    feature2Title: 'Print-Ready Spreadsheet Formatting',
    feature2Desc: [
      'Generates PDFs ready for printing or executive presentation in A4 and Letter page formats.',
      'Prevents unauthorized cell tampering or formula edits.',
      'Fast, automated spreadsheet conversion in seconds.'
    ],
    faqs: [
      { q: 'Will wide Excel sheets fit on a single page width?', a: 'Yes, PDFBullet automatically scales worksheet columns to fit horizontally on single page widths.' },
      { q: 'Can I convert XLSX and XLS files?', a: 'Yes, both .xlsx and legacy .xls spreadsheets are supported.' },
      { q: 'Are formulas visible in the PDF?', a: 'The final values and formatted tables are displayed exactly as shown in Excel.' },
      { q: 'Is my financial spreadsheet data secure?', a: 'Your data is strictly encrypted and protected with automatic post-conversion file deletion.' }
    ]
  }
};

const DEFAULT_SEO_DATA = (toolTitle: string): ToolSeoData => ({
  mainTitle: `${toolTitle} Online Tool`,
  mainSubtitle: `Process, convert, and manage your documents for free with PDFBullet's high-speed web application.`,
  feature1Title: `Fast & Accurate ${toolTitle}`,
  feature1Desc: [
    `Upload your document and execute ${toolTitle} in seconds with industry-leading precision.`,
    `Maintains full resolution, original layout, font styling, and document integrity.`,
    `Designed for students, business professionals, and educators who need reliable document processing.`
  ],
  feature2Title: `100% Free & Secure Client-Side Processing`,
  feature2Desc: [
    `Enjoy complete privacy—your files are handled securely using encrypted web protocols.`,
    `No software installation or account registration required for core features.`,
    `Compatible across all web browsers, Windows, Mac, Linux, iOS, and Android.`
  ],
  faqs: [
    { q: `Is ${toolTitle} completely free?`, a: `Yes! You can use ${toolTitle} 100% free with no hidden fees or subscriptions required.` },
    { q: `Are my uploaded files secure?`, a: `Absolutely. We prioritize your privacy with end-to-end encryption and automatic file cleanup.` },
    { q: `Do I need to install any software?`, a: `No installation is needed. All processing happens directly inside your web browser.` },
    { q: `Does this tool work on mobile devices?`, a: `Yes, PDFBullet is fully optimized for mobile smartphones and tablets.` }
  ]
});

export const ToolSeoFaqSection: React.FC<ToolSeoFaqSectionProps> = ({ toolId, toolTitle }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const data = SEO_DATA_MAP[toolId] || DEFAULT_SEO_DATA(toolTitle);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="w-full mt-16 pt-12 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-black/30 rounded-3xl p-6 sm:p-10">
      
      {/* Title Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
          {data.mainTitle}
        </h2>
        <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {data.mainSubtitle}
        </p>
      </div>

      {/* 2-Column Feature Breakdown with REAL SVG Icons */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        
        {/* Feature 1 */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-brand-red">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {data.feature1Title}
            </h3>
          </div>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {data.feature1Desc.map((desc, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-brand-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{desc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Feature 2 */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-brand-red">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {data.feature2Title}
            </h3>
          </div>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {data.feature2Desc.map((desc, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-brand-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{desc}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* FAQ Accordion Section */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-8">
          Frequently Asked Questions (FAQ)
        </h3>

        <div className="space-y-3">
          {data.faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-semibold text-gray-900 dark:text-gray-100 hover:text-brand-red dark:hover:text-brand-red transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  <span className={`p-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-brand-red transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-zinc-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
