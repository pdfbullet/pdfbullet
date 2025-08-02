import { Tool } from './types.ts';
import {
  MergeIcon,
  SplitIcon,
  CompressIcon,
  WordIcon,
  PowerPointIcon,
  ExcelIcon,
  EditIcon,
  PdfToJpgIcon,
  JpgToPdfIcon,
  SignIcon,
  WatermarkIcon,
  RotateIcon,
  HtmlToPdfIcon,
  UnlockIcon,
  ProtectIcon,
  OrganizeIcon,
  PdfToPdfAIcon,
  RepairIcon,
  PageNumbersIcon,
  ScanToPdfIcon,
  OcrPdfIcon,
  ComparePdfIcon,
  RedactPdfIcon,
  CropPdfIcon,
  ImageIcon,
  BgRemoveIcon,
  InvoiceIcon,
  PsdToPdfIcon,
  PdfToPngIcon,
  QuestionMarkIcon,
  BookOpenIcon,
  CVIcon,
  TrendingUpIcon,
  ZipIcon,
  ResizeIcon,
} from './components/icons.tsx';

export const TOOLS: Tool[] = [
  // Organize
  {
    id: 'merge-pdf',
    title: 'Merge PDF',
    description: 'Combine two or more PDF files into one single PDF.',
    Icon: MergeIcon,
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    textColor: 'text-orange-500',
    category: 'organize',
    api: { category: 'pdf' },
  },
  {
    id: 'split-pdf',
    title: 'Split PDF',
    description: 'Separate PDF pages or extract all pages into a PDF.',
    Icon: SplitIcon,
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    textColor: 'text-orange-500',
    category: 'organize',
    api: { category: 'pdf' },
  },
  {
    id: 'organize-pdf',
    title: 'Organize PDF',
    description: 'Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages to your document at your convenience.',
    Icon: OrganizeIcon,
    color: 'bg-orange-600',
    hoverColor: 'hover:bg-orange-700',
    textColor: 'text-orange-600',
    category: 'organize',
    api: { category: 'pdf' },
  },
  {
    id: 'rotate-pdf',
    title: 'Rotate PDF',
    description: 'Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!',
    Icon: RotateIcon,
    color: 'bg-indigo-500',
    hoverColor: 'hover:bg-indigo-600',
    textColor: 'text-indigo-500',
    category: 'organize',
    api: { category: 'pdf' },
  },
   {
    id: 'zip-maker',
    title: 'Create ZIP file',
    description: 'Easily create a ZIP archive from multiple files or an entire folder.',
    Icon: ZipIcon,
    color: 'bg-amber-600',
    hoverColor: 'hover:bg-amber-700',
    textColor: 'text-amber-600',
    category: 'organize',
    isNew: true,
    accept: {},
    api: { category: 'utility' as any },
  },
  
  // Optimize
  {
    id: 'compress-pdf',
    title: 'Compress PDF',
    description: 'Reduce file size while optimizing for maximal PDF quality.',
    Icon: CompressIcon,
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    textColor: 'text-green-500',
    category: 'optimize',
    api: { category: 'pdf' },
  },
  {
    id: 'repair-pdf',
    title: 'Repair PDF',
    description: 'Repair a corrupted or broken PDF file.',
    Icon: RepairIcon,
    color: 'bg-lime-600',
    hoverColor: 'hover:bg-lime-700',
    textColor: 'text-lime-600',
    isPremium: true,
    category: 'optimize',
    api: { category: 'pdf' },
  },
  {
    id: 'resize-file',
    title: 'Resize File',
    description: 'Change the file size of images or PDFs by adjusting quality and compression.',
    Icon: ResizeIcon,
    color: 'bg-cyan-600',
    hoverColor: 'hover:bg-cyan-700',
    textColor: 'text-cyan-600',
    category: 'optimize',
    isNew: true,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'], 'application/pdf': ['.pdf'] },
    api: { category: 'utility' as any },
  },

  // Convert To
  {
    id: 'jpg-to-pdf',
    title: 'Image to PDF',
    description: 'Convert JPG, TIFF and PNG images to PDF.',
    Icon: JpgToPdfIcon,
    color: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-600',
    textColor: 'text-yellow-500',
    isNew: true,
    category: 'convert-to',
    accept: { 'image/jpeg': ['.jpeg', '.jpg'], 'image/png': ['.png'] },
    api: { category: 'pdf' },
  },
  {
    id: 'psd-to-pdf',
    title: 'PSD to PDF',
    description: 'Convert Adobe Photoshop files (PSD) to PDF documents easily.',
    Icon: PsdToPdfIcon,
    color: 'bg-sky-600',
    hoverColor: 'hover:bg-sky-700',
    textColor: 'text-sky-600',
    isNew: true,
    category: 'convert-to',
    accept: { 'image/vnd.adobe.photoshop': ['.psd'], 'application/octet-stream': ['.psd'] },
    api: { category: 'pdf' },
  },
  {
    id: 'word-to-pdf',
    title: 'Word to PDF',
    description: 'Convert Microsoft Word documents (DOCX) to PDF.',
    Icon: WordIcon,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    textColor: 'text-blue-500',
    category: 'convert-to',
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    api: { category: 'pdf' },
  },
  {
    id: 'powerpoint-to-pdf',
    title: 'PowerPoint to PDF',
    description: 'Make PPT and PPTX slideshows easy to view by converting them to PDF.',
    Icon: PowerPointIcon,
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
    textColor: 'text-red-500',
    category: 'convert-to',
    accept: { 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'] },
    api: { category: 'pdf' },
  },
  {
    id: 'excel-to-pdf',
    title: 'Excel to PDF',
    description: 'Make EXCEL spreadsheets easy to read by converting them to PDF.',
    Icon: ExcelIcon,
    color: 'bg-green-700',
    hoverColor: 'hover:bg-green-800',
    textColor: 'text-green-700',
    category: 'convert-to',
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    api: { category: 'pdf' },
  },
   {
    id: 'html-to-pdf',
    title: 'HTML to PDF',
    description: 'Convert webpages in HTML to PDF documents.',
    Icon: HtmlToPdfIcon,
    color: 'bg-yellow-600',
    hoverColor: 'hover:bg-yellow-700',
    textColor: 'text-yellow-600',
    category: 'convert-to',
    api: { category: 'pdf' },
  },
  {
    id: 'scan-to-pdf',
    title: 'Scan to PDF',
    description: 'Turn your phone into a document scanner. Capture, edit, and correct the perspective of your documents to create high-quality scans.',
    Icon: ScanToPdfIcon,
    color: 'bg-amber-500',
    hoverColor: 'hover:bg-amber-600',
    textColor: 'text-amber-500',
    isNew: true,
    category: 'convert-to',
  },

  // Convert From
  {
    id: 'pdf-to-jpg',
    title: 'PDF to JPG',
    description: 'Convert PDF pages into JPG or extract all images contained in a PDF.',
    Icon: PdfToJpgIcon,
    color: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-600',
    textColor: 'text-yellow-500',
    category: 'convert-from',
    api: { category: 'pdf' },
  },
  {
    id: 'pdf-to-png',
    title: 'PDF to PNG',
    description: 'Convert each PDF page into a high-quality PNG image.',
    Icon: PdfToPngIcon,
    color: 'bg-lime-500',
    hoverColor: 'hover:bg-lime-600',
    textColor: 'text-lime-500',
    isNew: true,
    category: 'convert-from',
    api: { category: 'pdf' },
  },
  {
    id: 'pdf-to-word',
    title: 'PDF to Word',
    description: 'Turn your PDF into an editable DOCX file. Our PDF to Word converter accurately preserves formatting, tables, and text.',
    Icon: WordIcon,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    textColor: 'text-blue-500',
    category: 'convert-from',
    api: { category: 'pdf' },
  },
  {
    id: 'pdf-to-powerpoint',
    title: 'PDF to PowerPoint',
    description: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.',
    Icon: PowerPointIcon,
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
    textColor: 'text-red-500',
    isPremium: true,
    category: 'convert-from',
    api: { category: 'pdf' },
  },
  {
    id: 'pdf-to-excel',
    title: 'PDF to Excel',
    description: 'Pull data straight from your PDFs into editable Excel spreadsheets. Convert PDF tables to XLS with just a few clicks.',
    Icon: ExcelIcon,
    color: 'bg-green-700',
    hoverColor: 'hover:bg-green-800',
    textColor: 'text-green-700',
    category: 'convert-from',
    api: { category: 'pdf' },
  },
  {
    id: 'pdf-to-pdfa',
    title: 'PDF to PDF/A',
    description: 'Transform your PDF to PDF/A for long-term archiving.',
    Icon: PdfToPdfAIcon,
    color: 'bg-slate-500',
    hoverColor: 'hover:bg-slate-600',
    textColor: 'text-slate-500',
    category: 'convert-from',
    api: { category: 'pdf' },
  },
  {
    id: 'extract-text',
    title: 'Extract text',
    description: 'Extract all text from a PDF file to a TXT file.',
    Icon: OcrPdfIcon,
    color: 'bg-red-400',
    hoverColor: 'hover:bg-red-500',
    textColor: 'text-red-400',
    category: 'convert-from',
    api: { category: 'pdf' },
  },


  // Edit
  {
    id: 'edit-pdf',
    title: 'Edit PDF',
    description: 'Add text, images and shapes to a PDF document.',
    Icon: EditIcon,
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    textColor: 'text-purple-500',
    isPremium: true,
    isNew: true,
    category: 'edit',
    api: { category: 'pdf' },
  },
  {
    id: 'page-numbers',
    title: 'Page numbers',
    description: 'Insert page numbers in a PDF in your preferred style.',
    Icon: PageNumbersIcon,
    color: 'bg-fuchsia-500',
    hoverColor: 'hover:bg-fuchsia-600',
    textColor: 'text-fuchsia-500',
    isPremium: true,
    category: 'edit',
    api: { category: 'pdf' },
  },
  {
    id: 'crop-pdf',
    title: 'Crop PDF',
    description: 'Crop margins of PDF files to change the page size or remove unwanted areas.',
    Icon: CropPdfIcon,
    color: 'bg-rose-500',
    hoverColor: 'hover:bg-rose-600',
    textColor: 'text-rose-500',
    isPremium: true,
    category: 'edit',
    api: { category: 'pdf' },
  },
   {
    id: 'ocr-pdf',
    title: 'OCR PDF',
    description: 'Convert a scanned PDF into a searchable PDF.',
    Icon: OcrPdfIcon,
    color: 'bg-teal-500',
    hoverColor: 'hover:bg-teal-600',
    textColor: 'text-teal-500',
    isPremium: true,
    category: 'edit',
    api: { category: 'pdf' },
  },
  {
    id: 'compare-pdf',
    title: 'Compare PDF',
    description: 'Show a side-by-side comparison of two PDF files to spot the differences.',
    Icon: ComparePdfIcon,
    color: 'bg-sky-500',
    hoverColor: 'hover:bg-sky-600',
    textColor: 'text-sky-500',
    isPremium: true,
    category: 'edit',
    api: { category: 'pdf' },
  },
  {
    id: 'redact-pdf',
    title: 'Redact PDF',
    description: 'Redact text and graphics from your PDF to permanently remove sensitive information.',
    Icon: RedactPdfIcon,
    color: 'bg-slate-700',
    hoverColor: 'hover:bg-slate-800',
    textColor: 'text-slate-700',
    isPremium: true,
    category: 'edit',
    api: { category: 'pdf' },
  },
  {
    id: 'ai-question-generator',
    title: 'AI Question Generator',
    description: 'Automatically create questions from any text using AI. Perfect for study guides and quizzes.',
    Icon: QuestionMarkIcon,
    color: 'bg-purple-600',
    hoverColor: 'hover:bg-purple-700',
    textColor: 'text-purple-600',
    isNew: true,
    category: 'edit',
  },
  
  // Business
  {
    id: 'invoice-generator',
    title: 'Invoice Generator',
    description: 'Create professional invoices for free. Customize with your logo, add items, and download as PDF.',
    Icon: InvoiceIcon,
    color: 'bg-teal-500',
    hoverColor: 'hover:bg-teal-600',
    textColor: 'text-teal-500',
    isNew: true,
    category: 'business',
  },
  {
    id: 'cv-generator',
    title: 'CV Generator',
    description: 'Create a professional CV by providing your details. Choose from multiple templates and download as a PDF.',
    Icon: CVIcon,
    color: 'bg-cyan-600',
    hoverColor: 'hover:bg-cyan-700',
    textColor: 'text-cyan-600',
    isNew: true,
    category: 'business',
  },
  {
    id: 'lesson-plan-creator',
    title: 'Lesson Plan Creator',
    description: 'Create detailed, engaging lesson plans for any subject in seconds. Let AI build a plan with activities, assessments, and homework.',
    Icon: BookOpenIcon,
    color: 'bg-indigo-500',
    hoverColor: 'hover:bg-indigo-600',
    textColor: 'text-indigo-500',
    isNew: true,
    category: 'business',
  },
  
  // Security
  {
    id: 'unlock-pdf',
    title: 'Unlock PDF',
    description: 'Remove PDF password security for reading and editing.',
    Icon: UnlockIcon,
    color: 'bg-cyan-500',
    hoverColor: 'hover:bg-cyan-600',
    textColor: 'text-cyan-500',
    category: 'security',
    api: { category: 'pdf' },
  },
  {
    id: 'protect-pdf',
    title: 'Protect PDF',
    description: 'Encrypt PDF with a password to prevent unauthorized use.',
    Icon: ProtectIcon,
    color: 'bg-blue-800',
    hoverColor: 'hover:bg-blue-900',
    textColor: 'text-blue-800',
    category: 'security',
    api: { category: 'pdf' },
  },
  {
    id: 'sign-pdf',
    title: 'Sign PDF',
    description: 'Sign yourself or request electronic signatures from others.',
    Icon: SignIcon,
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    textColor: 'text-blue-600',
    isPremium: true,
    category: 'security',
    api: { category: 'signature' },
  },
  {
    id: 'watermark-pdf',
    title: 'Watermark',
    description: 'Insert a text or image-based watermark to PDF documents.',
    Icon: WatermarkIcon,
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    textColor: 'text-purple-500',
    category: 'security',
    api: { category: 'pdf' },
  },
  
  // == IMAGE API TOOLS ==
  {
    id: 'resize-image',
    title: 'Resize image',
    description: 'Define your dimensions, by percentage or pixel, and resize your JPG, PNG, and GIF images.',
    Icon: ResizeIcon,
    color: 'bg-blue-400',
    hoverColor: 'hover:bg-blue-500',
    textColor: 'text-blue-400',
    category: 'edit',
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] },
    api: { category: 'image' },
  },
  {
    id: 'remove-background',
    title: 'Remove background',
    description: 'Remove background from images automatically with AI model.',
    Icon: BgRemoveIcon,
    color: 'bg-green-400',
    hoverColor: 'hover:bg-green-500',
    textColor: 'text-green-400',
    category: 'edit',
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    api: { category: 'image' },
  },
  {
    id: 'crop-image',
    title: 'Crop image',
    description: 'Crop JPG, PNG, or GIFs with ease.',
    Icon: CropPdfIcon,
    color: 'bg-red-400',
    hoverColor: 'hover:bg-red-500',
    textColor: 'text-red-400',
    category: 'edit',
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] },
    api: { category: 'image' },
  },
  {
    id: 'convert-to-jpg',
    title: 'Convert to JPG',
    description: 'Convert PNG, GIF, TIF, PSD, SVG, WEBP or RAW to JPG.',
    Icon: JpgToPdfIcon,
    color: 'bg-yellow-400',
    hoverColor: 'hover:bg-yellow-500',
    textColor: 'text-yellow-400',
    category: 'convert-to',
    accept: { 'image/*': ['.png', '.gif', '.tif', '.tiff', '.psd', '.svg', '.webp'] },
    api: { category: 'image' },
  },
  {
    id: 'convert-from-jpg',
    title: 'Convert from JPG',
    description: 'Convert from JPG to PNG or GIF.',
    Icon: PdfToJpgIcon,
    color: 'bg-yellow-400',
    hoverColor: 'hover:bg-yellow-500',
    textColor: 'text-yellow-400',
    category: 'convert-from',
    accept: { 'image/jpeg': ['.jpg', '.jpeg'] },
    api: { category: 'image' },
  },
  {
    id: 'compress-image',
    title: 'Compress Image',
    description: 'Reduce file size while optimizing for maximal image quality.',
    Icon: CompressIcon,
    color: 'bg-green-400',
    hoverColor: 'hover:bg-green-500',
    textColor: 'text-green-400',
    category: 'optimize',
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    api: { category: 'image' },
  },
  {
    id: 'watermark-image',
    title: 'Watermark Image',
    description: 'Stamp an image or text over your images in seconds.',
    Icon: WatermarkIcon,
    color: 'bg-purple-400',
    hoverColor: 'hover:bg-purple-500',
    textColor: 'text-purple-400',
    category: 'edit',
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    api: { category: 'image' },
  },
];

export const blogPosts = [
    {
    slug: 'neb-class-12-result-2081-2082',
    title: 'NEB Class 12 Result 2082/2081 (2025): The Ultimate Guide to Check Your Marksheet Online',
    date: 'July 15, 2025',
    excerpt: 'The complete guide to checking your NEB Class 12 Result for 2081/2082. Find official websites like neb.gov.np and ntc.net.np, SMS methods, IVR, and step-by-step instructions to view your results with marksheet. Understand the new grading system and get answers to all your FAQs. Your one-stop resource for the 2025 NEB results is here.',
    content: `The long wait is almost over for the hundreds of thousands of students who appeared for the National Examinations Board (NEB) Class 12 examinations in 2081/2082. This result is a pivotal moment, serving as the gateway to higher education and future career paths. The anticipation can be overwhelming, with students and parents eagerly searching for the fastest and most reliable ways to check the results. To ease this process, we have created the ultimate, comprehensive guide with all the verified information you need to check your NEB Class 12 Result 2081/2082 the moment it is published.

This guide provides direct links to official websites, step-by-step instructions for checking results via SMS, IVR, and USSD, and detailed information on the latest grading system. We understand that on result day, official websites can be slow or unresponsive due to high traffic. That's why we've compiled a list of alternative methods and multiple web portals to ensure you get your result without delay.

<a href="https://neb.ntc.net.np/" target="_blank" rel="noopener noreferrer" class="inline-block bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-8 rounded-lg my-6 no-underline text-lg">Check NEB Class 12 Result Now</a>

<h2>When Will the NEB Class 12 Result 2081/2082 Be Published?</h2>
<p>While the National Examinations Board (NEB) has not announced an exact date, based on previous years' trends, the results for the Class 12 examinations are typically published by the end of Shrawan or the first week of Bhadra. The board is currently in the final stages of checking and tabulating the results. We recommend students to stay updated through the official NEB website (neb.gov.np) and reliable news portals. You can also bookmark this page, as we will update it with the latest information as soon as it becomes available.</p>

<h2>5 Easy Methods to Check Your NEB Class 12 Result</h2>
<p>Here are the most reliable and fastest methods to check your result with your marksheet. Make sure you have your Symbol Number and Date of Birth (in BS format: YYYY-MM-DD) ready.</p>

<h3>1. Official Websites</h3>
<p>The most reliable way to check your NEB result is by visiting the official websites. This method provides a complete marksheet which you can download and print.</p>
<ol class="list-decimal list-inside space-y-2 my-4">
    <li>Go to one of the official websites listed in the table below.</li>
    <li>Look for the link that says "NEB Class 12 Result 2081" or something similar.</li>
    <li>Enter your Symbol Number and Date of Birth (in BS format).</li>
    <li>Click the "Submit" or "View Result" button.</li>
    <li>Your result, along with a detailed marksheet, will appear on the screen. It is highly recommended to download or print it for future reference.</li>
</ol>
<div class="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700">
  <table class="min-w-full bg-white dark:bg-black">
    <thead class="bg-gray-100 dark:bg-gray-800">
      <tr>
        <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Website Name</th>
        <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">URL</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
      <tr><td class="px-4 py-2">NEB Official Website</td><td class="px-4 py-2"><a href="http://www.neb.gov.np" target="_blank" rel="noopener noreferrer" class="text-brand-red hover:underline">www.neb.gov.np</a></td></tr>
      <tr><td class="px-4 py-2">Nepal Telecom Portal</td><td class="px-4 py-2"><a href="http://neb.ntc.net.np" target="_blank" rel="noopener noreferrer" class="text-brand-red hover:underline">neb.ntc.net.np</a></td></tr>
      <tr><td class="px-4 py-2">I Love PDFLY Result Hub</td><td class="px-4 py-2"><a href="https://ilovepdfly.com/blog/neb-class-12-result-2081-2082" class="text-brand-red hover:underline">ilovepdfly.com (You are here!)</a></td></tr>
      <tr><td class="px-4 py-2">Edusanjal</td><td class="px-4 py-2"><a href="http://see.edusanjal.com" target="_blank" rel="noopener noreferrer" class="text-brand-red hover:underline">see.edusanjal.com</a></td></tr>
      <tr><td class="px-4 py-2">Kantipur Publications</td><td class="px-4 py-2"><a href="http://results.ekantipur.com/" target="_blank" rel="noopener noreferrer" class="text-brand-red hover:underline">results.ekantipur.com</a></td></tr>
    </tbody>
  </table>
</div>

<h3>2. SMS Method (Nepal Telecom)</h3>
<p>If you don’t have internet access or if the websites are down, you can easily check your result by sending an SMS from your NTC SIM card.</p>
<ol class="list-decimal list-inside space-y-2 my-4">
    <li>Open your phone’s messaging app.</li>
    <li>Compose a new message and type: <strong>NEB &lt;space&gt; Your_Symbol_Number</strong></li>
    <li>Send the message to <strong>1600</strong>.</li>
    <li>For example: If your symbol number is 12345678, you would type <strong>NEB 12345678</strong>.</li>
    <li>Shortly after, you will receive an SMS with your GPA and overall result.</li>
</ol>
<div class="my-4 p-4 bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-300">
    <strong>Did You Know?</strong> Over 400,000 students appear for the NEB Class 12 exam every year in Nepal. That’s why websites often slow down or crash on result day. Using SMS, USSD, or apps like Khalti and eSewa can help you get results faster without delay!
</div>


<h3>3. IVR Method (Interactive Voice Response)</h3>
<p>Another offline option is to call the IVR system from any NTC mobile or landline to listen to your result.</p>
<ol class="list-decimal list-inside space-y-2 my-4">
    <li>Dial <strong>1601</strong> from your NTC phone.</li>
    <li>Follow the voice instructions provided by the operator.</li>
    <li>Enter your symbol number when prompted.</li>
    <li>Wait for a few moments as the system announces your result.</li>
</ol>

<h3>4. USSD Code Service</h3>
<p>You can also use the USSD service to check your grade 12 result. This method is fast and does not require an internet connection or balance (it's free on the NTC network).</p>
<ol class="list-decimal list-inside space-y-2 my-4">
    <li>Open your phone's dialer.</li>
    <li>Dial <strong>*1601#</strong> and press the call button.</li>
    <li>Follow the on-screen instructions that appear.</li>
    <li>Enter your symbol number.</li>
    <li>Your result will be instantly displayed on your phone screen.</li>
</ol>

<h3>5. Mobile Apps: Khalti and eSewa</h3>
<p>Popular digital wallets like Khalti and eSewa offer easy result-checking features directly within their apps. This method is user-friendly and convenient if you already use these apps for payments.</p>
<ol class="list-decimal list-inside space-y-2 my-4">
    <li>Open the Khalti or eSewa app on your smartphone.</li>
    <li>Navigate to the 'Education' or 'NEB Result' section (it's usually on the homepage during result season).</li>
    <li>Enter your symbol number and date of birth.</li>
    <li>Tap the 'View Result' button to see your marksheet.</li>
</ol>

<h2>Understanding the NEB Class 12 Grading System</h2>
<p>The NEB uses a letter grading system with a corresponding Grade Point Average (GPA). It's crucial to understand this system to interpret your marksheet correctly. Here is the detailed breakdown:</p>
<div class="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700">
  <table class="min-w-full bg-white dark:bg-black">
    <thead class="bg-gray-100 dark:bg-gray-800">
      <tr>
        <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Percentage (%)</th>
        <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Grade</th>
        <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Description</th>
        <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Grade Point</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
      <tr><td class="px-4 py-2">90 to 100</td><td class="px-4 py-2 font-bold">A+</td><td class="px-4 py-2">Outstanding</td><td class="px-4 py-2">4.0</td></tr>
      <tr><td class="px-4 py-2">80 to below 90</td><td class="px-4 py-2 font-bold">A</td><td class="px-4 py-2">Excellent</td><td class="px-4 py-2">3.6</td></tr>
      <tr><td class="px-4 py-2">70 to below 80</td><td class="px-4 py-2 font-bold">B+</td><td class="px-4 py-2">Very Good</td><td class="px-4 py-2">3.2</td></tr>
      <tr><td class="px-4 py-2">60 to below 70</td><td class="px-4 py-2 font-bold">B</td><td class="px-4 py-2">Good</td><td class="px-4 py-2">2.8</td></tr>
      <tr><td class="px-4 py-2">50 to below 60</td><td class="px-4 py-2 font-bold">C+</td><td class="px-4 py-2">Satisfactory</td><td class="px-4 py-2">2.4</td></tr>
      <tr><td class="px-4 py-2">40 to below 50</td><td class="px-4 py-2 font-bold">C</td><td class="px-4 py-2">Acceptable</td><td class="px-4 py-2">2.0</td></tr>
      <tr><td class="px-4 py-2">35 to below 40</td><td class="px-4 py-2 font-bold">D</td><td class="px-4 py-2">Basic</td><td class="px-4 py-2">1.6</td></tr>
      <tr><td class="px-4 py-2" colspan="4">Below 35% in theory subjects is considered 'Non-Graded (NG)' and the final GPA will not be calculated.</td></tr>
    </tbody>
  </table>
</div>

<h2>Frequently Asked Questions (FAQs)</h2>
<div class="space-y-4 mt-6">
  <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
    <h4 class="font-semibold text-lg">What is the minimum GPA required to pass Class 12?</h4>
    <p>To be eligible for higher studies, a student must obtain a minimum of a 'D' grade (1.6 GPA) in all theory subjects and a 'C' grade in practical subjects. Additionally, students must not have an 'NG' (Non-Graded) result in any subject.</p>
  </div>
  <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
    <h4 class="font-semibold text-lg">What does 'NG' (Non-Graded) mean?</h4>
    <p>'NG' means that a student has scored below the minimum required marks (35%) in a theory subject. If you have an 'NG' in any subject, your final GPA will not be awarded, and you will need to appear for a supplementary (grade improvement) exam for that subject.</p>
  </div>
  <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
    <h4 class="font-semibold text-lg">How can I apply for a re-totaling or re-checking?</h4>
    <p>If you are not satisfied with your result, the NEB provides an opportunity to apply for re-totaling. The notice for this is usually published along with the results on the official NEB website. You will have to fill out a form and pay a nominal fee per subject within a specified timeframe.</p>
  </div>
   <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
    <h4 class="font-semibold text-lg">When will I get my official transcript and certificate?</h4>
    <p>The original academic transcript and migration certificate are usually distributed to schools/colleges a few weeks after the results are published. You should contact your college administration for information on when you can collect them.</p>
  </div>
</div>`,
    image: 'https://ik.imagekit.io/fonepay/class%2012%20result.png?updatedAt=1753244853921',
    author: 'The I Love PDFLY Team',
    authorImage: 'https://ik.imagekit.io/fonepay/I%20lovePDLY%20logo.PNG?updatedAt=1753104228877',
    tags: ['NEB Result', 'Class 12', 'Education', 'Nepal', 'Result 2082'],
    },
    {
        slug: 'build-a-professional-cv-in-minutes-with-ai',
        title: 'Build a Professional CV in Minutes with Our New AI-Powered Generator',
        date: 'August 10, 2025',
        excerpt: 'Landing your dream job starts with a perfect CV. Our new free CV Generator helps you create a polished, professional resume in minutes. Choose from modern templates, fill in your details, and download a job-ready PDF.',
        content: `<h2>The First Impression Matters Most</h2>
<p>In today's competitive job market, your Curriculum Vitae (CV) is often the very first impression you make on a potential employer. A well-structured, professional, and error-free CV can be the difference between landing an interview and being overlooked. However, creating one from scratch can be a daunting task. Which template should you use? What information is most important? How do you format it correctly?</p>

<h2>Introducing the I Love PDFLY CV Generator</h2>
<p>We're excited to introduce a powerful new tool to our suite: the free <a href="/#/cv-generator" class="text-brand-red hover:underline">CV Generator</a>. We've taken the stress and guesswork out of resume building by creating an intuitive, step-by-step process that guides you toward a perfect, job-winning CV.</p>

<h2>Key Features of the CV Generator</h2>
<ul class="list-disc list-inside space-y-2 my-4">
    <li><strong>Professionally Designed Templates:</strong> Choose from a selection of clean, modern templates that are proven to be effective and easy for recruiters to read. No more struggling with Word formatting!</li>
    <li><strong>Guided Sections:</strong> Our tool walks you through every essential section: personal details, professional summary, work experience, education, skills, and projects. Just fill in the blanks.</li>
    <li><strong>Easy Editing:</strong> Add, remove, and reorder sections with ease. Our live preview shows you exactly what your final CV will look like as you type.</li>
    <li><strong>Instant PDF Download:</strong> Once you're finished, download your CV as a high-quality, universally compatible PDF file, ready to be sent to employers.</li>
</ul>

<h2>How to Create Your CV in 5 Simple Steps</h2>
<p>Ready to build your new CV? It's incredibly simple:</p>
<ol class="list-decimal list-inside space-y-2 my-4">
    <li><strong>Navigate to the Tool:</strong> Go to the <a href="/#/cv-generator" class="text-brand-red hover:underline">CV Generator</a> page.</li>
    <li><strong>Fill in Your Details:</strong> Enter your information into the guided form on the left panel, covering everything from your contact info to your work history.</li>
    <li><strong>Upload a Professional Photo (Optional):</strong> Add a professional headshot to give your CV a personal touch.</li>
    <li><strong>Choose Your Design:</strong> Select a template and an accent color that best represents your professional brand.</li>
    <li><strong>Download Your PDF:</strong> Click the "Download PDF" button to instantly save your polished, professional CV.</li>
</ol>
<p>Stop letting CV formatting stand in the way of your career goals. Create a document that makes you stand out and land the interview you deserve. Try our free CV Generator today!</p>`,
        image: 'https://ik.imagekit.io/fonepay/ilovepdfly%20blog.png?updatedAt=1753465347545',
        author: 'The I Love PDFLY Team',
        authorImage: 'https://ik.imagekit.io/fonepay/I%20lovePDLY%20logo.PNG?updatedAt=1753104228877',
        tags: ['CV Generator', 'Resume Builder', 'Job Search', 'Career', 'Free CV Maker', 'How To'],
    },
    {
        slug: 'ai-lesson-plan-creator-for-teachers',
        title: 'Your New Teaching Assistant: The AI Lesson Plan Creator',
        date: 'August 9, 2025',
        excerpt: 'Teachers, reclaim your time! Our new AI Lesson Plan Creator generates detailed, engaging, and curriculum-aligned lesson plans for any subject in seconds. Spend less time on paperwork and more time inspiring your students.',
        content: `<h2>The Challenge of Modern Teaching</h2>
<p>Educators are the backbone of our society, but the demands on their time are immense. Lesson planning, in particular, is a critical but incredibly time-consuming task. Crafting engaging, effective, and curriculum-aligned plans for every class can take hours each week—hours that could be spent interacting with students or focusing on professional development.</p>

<h2>Save Time with the AI Lesson Plan Creator</h2>
<p>We believe technology should empower teachers, not add to their workload. That’s why we’re thrilled to launch the <a href="/#/lesson-plan-creator" class="text-brand-red hover:underline">AI Lesson Plan Creator</a>, a revolutionary tool designed to be every teacher's new favorite assistant.</p>
<p>Simply provide a few key details—grade level, subject, topic, and class duration—and our AI will generate a comprehensive and structured lesson plan in seconds. It's designed to give you a high-quality, editable foundation that you can adapt to your unique classroom needs.</p>

<h2>What Does a Generated Lesson Plan Include?</h2>
<p>Our AI doesn't just give you a vague outline. It creates a complete, actionable plan with all the essential components:</p>
<ul class="list-disc list-inside space-y-2 my-4">
    <li><strong>Clear Objectives:</strong> Concrete learning goals for students to achieve.</li>
    <li><strong>Engaging Introduction:</strong> A creative "hook" to capture your students' attention from the start.</li>
    <li><strong>Step-by-Step Activities:</strong> Detailed main teaching activities, including suggestions for group work and interaction.</li>
    <li><strong>Assessment Ideas:</strong> Practical ways to check for understanding, from quick quizzes to group discussions.</li>
    <li><strong>Homework Assignments:</strong> Relevant and meaningful practice for students to complete after class.</li>
    <li><strong>Materials List:</strong> A checklist of all the resources you'll need for the lesson.</li>
</ul>

<h2>How It Works</h2>
<ol class="list-decimal list-inside space-y-2 my-4">
    <li><strong>Go to the Tool:</strong> Visit the <a href="/#/lesson-plan-creator" class="text-brand-red hover:underline">AI Lesson Plan Creator</a>.</li>
    <li><strong>Enter Your Lesson Details:</strong> Specify the grade, subject, topic, and duration. You can even suggest a teaching style (e.g., "Interactive & Hands-on").</li>
    <li><strong>Generate the Plan:</strong> Click the "Generate" button and watch as the AI crafts your lesson plan in real-time.</li>
    <li><strong>Review and Refine:</strong> Use the generated plan as-is, or copy and paste it into your favorite editor to tweak and personalize it for your students.</li>
</ol>
<p>The AI Lesson Plan Creator is more than a tool; it's a partner in education. It's here to help you reduce prep time, overcome creative blocks, and focus on what you do best: teaching. Give it a try and revolutionize your planning process today!</p>`,
        image: 'https://ik.imagekit.io/fonepay/4B237CD5-C59B-4982-9ED4-E9A479E8BDA1.png?updatedAt=1753468582689',
        author: 'The I Love PDFLY Team',
        authorImage: 'https://ik.imagekit.io/fonepay/I%20lovePDLY%20logo.PNG?updatedAt=1753104228877',
        tags: ['Lesson Plan Creator', 'AI for Teachers', 'Education', 'EdTech', 'Teaching Tools', 'Productivity'],
    },
    {
        slug: 'turn-any-text-into-a-quiz-ai-question-generator',
        title: 'Study Smarter: Turn Any Text into a Quiz with Our AI Question Generator',
        date: 'August 8, 2025',
        excerpt: 'Transform your study materials instantly! Our new AI Question Generator takes any text—from articles to textbook chapters—and automatically creates a variety of quiz questions to help you learn and retain information more effectively.',
        content: `<h2>The Power of Active Recall in Learning</h2>
<p>Reading and highlighting text is a common study method, but research shows that one of the most effective ways to learn and remember information is through "active recall"—the process of actively retrieving information from your memory. In other words, quizzing yourself is one of the best ways to study.</p>
<p>But creating good questions takes time and effort. What if you could instantly generate a quiz from any text you're studying? Now you can.</p>

<h2>Introducing the AI Question Generator</h2>
<p>We are excited to launch our <a href="/#/ai-question-generator" class="text-brand-red hover:underline">AI Question Generator</a>, a powerful tool for students, teachers, and lifelong learners. Simply paste any text into the tool, and our AI will analyze the content and generate a diverse set of questions to test your knowledge.</p>

<h2>How Can It Help You?</h2>
<ul class="list-disc list-inside space-y-2 my-4">
    <li><strong>For Students:</strong> Instantly create a practice quiz from your lecture notes, textbook chapters, or online articles. Test your understanding before an exam and identify areas where you need to review.</li>
    <li><strong>For Teachers:</strong> Quickly generate questions for a pop quiz, a worksheet, or a study guide. Save valuable prep time while still providing valuable learning materials for your students.</li>
    <li><strong>For Anyone:</strong> Want to make sure you understood that dense news article or business report? Paste it in and get a set of questions to confirm your comprehension.</li>
</ul>

<h2>A Variety of Question Types</h2>
<p>To ensure a comprehensive review, our AI generates a mix of question formats based on your text, including:</p>
<ul class="list-disc list-inside space-y-2 my-4">
    <li><strong>Multiple Choice:</strong> Test your knowledge with several options.</li>
    <li><strong>True/False:</strong> Verify key facts and statements.</li>
    <li><strong>Short Answer:</strong> Challenge yourself to recall specific information and concepts.</li>
</ul>
<p>Each question comes with the correct answer, so you can check your work immediately. Stop just reading and start actively learning. Turn your study material into an interactive learning experience with the AI Question Generator today!</p>`,
        image: 'https://ik.imagekit.io/fonepay/7543789B-8C56-4BF2-9952-6D6C2F17BA25.png?updatedAt=1753468583193',
        author: 'The I Love PDFLY Team',
        authorImage: 'https://ik.imagekit.io/fonepay/I%20lovePDLY%20logo.PNG?updatedAt=1753104228877',
        tags: ['AI Question Generator', 'Study Tools', 'Education', 'Quiz Maker', 'Learning', 'Productivity', 'AI'],
    },
    {
    slug: 'you-can-now-edit-images-in-ilovepdfly',
    title: 'You can now edit images in I Love PDFLY',
    date: 'August 4, 2025',
    excerpt: 'Exciting news! I Love PDFLY is expanding beyond PDFs. Discover our powerful new image editing tools, including a one-click Background Remover, designed to streamline your creative workflow. Edit your images and convert them to PDF all in one place.',
    content: `<h2>More Than Just PDFs: Welcome to Image Editing!</h2>
<p>We've always been your go-to solution for everything PDF, but we know your projects often involve more than just documents. That's why we're thrilled to announce that I Love PDFLY is expanding its toolkit to include powerful, easy-to-use image editing features!</p>
<p>Now, you can manage both your documents and your images in one convenient place, streamlining your workflow and boosting your productivity. Say goodbye to switching between different apps—your complete toolkit is right here.</p>

<h2>Introducing a Game-Changer: One-Click Background Removal</h2>
<p>Have you ever needed to isolate a subject from its background for a presentation, a product photo, or a creative project? Our new <a href="/#/remove-background" class="text-brand-red hover:underline">Remove Background tool</a> makes this complex task incredibly simple.</p>
<ul class="list-disc list-inside space-y-2 my-4">
    <li><strong>Effortless and Automatic:</strong> Simply upload your image (PNG or JPG), and our AI will automatically detect and remove the background with precision.</li>
    <li><strong>Perfect for Any Project:</strong> Create clean product images for your e-commerce store, professional headshots for your profile, or stunning graphics for your presentations.</li>
    <li><strong>High-Quality Results:</strong> Get a crisp, clean cutout with a transparent background, ready to be used anywhere.</li>
</ul>
<p>No more tedious manual selection or expensive software. It's professional-grade background removal, and it's free to use.</p>

<h2>A Complete Image-to-Document Workflow</h2>
<p>Our new image tools are designed to work seamlessly with our existing PDF features, creating a complete workflow from image to final document.</p>
<ol class="list-decimal list-inside space-y-2 my-4">
    <li><strong>Edit Your Image:</strong> Start by perfecting your image. Use the <a href="/#/remove-background" class="text-brand-red hover:underline">Remove Background</a> tool to get a clean cutout.</li>
    <li><strong>Convert to PDF:</strong> Once your image is ready, use our trusted <a href="/#/jpg-to-pdf" class="text-brand-red hover:underline">JPG to PDF</a> tool to convert single or multiple images into a high-quality PDF document.</li>
    <li><strong>Organize and Share:</strong> Need to add the new image PDF to an existing report? Use our <a href="/#/merge-pdf" class="text-brand-red hover:underline">Merge PDF</a> tool to combine it with other documents. Your polished, professional document is now ready to be shared.</li>
</ol>
<p>You can even capture images directly from your camera and convert them on the fly with our <a href="/#/scan-to-pdf" class="text-brand-red hover:underline">Scan to PDF</a> tool, making it easier than ever to digitize and manage your visual content.</p>

<h2>What's Next?</h2>
<p>This is just the beginning of our journey into image editing. We're committed to building the most comprehensive and user-friendly toolkit for all your digital needs. We can't wait for you to try out these new features and hear your feedback!</p>
<p>Ready to get started? Explore our new image tools today!</p>`,
    image: 'https://www.ilovepdf.com/storage/blog/55-1623331581-iOS-mobile-app@348w.jpeg',
    author: 'The I Love PDFLY Team',
    authorImage: 'https://ik.imagekit.io/fonepay/I%20lovePDLY%20logo.PNG?updatedAt=1753104228877',
    tags: ['Image Editing', 'New Feature', 'Productivity', 'Remove Background', 'Photo Editor', 'Design'],
    },
    {
    slug: 'the-best-free-graphic-design-software-2025',
    title: 'The best free graphic design software: 32 must-have tools (2025)',
    date: 'January 4, 2024',
    excerpt: 'Explore graphic design tools ranging from color pallets & AI image generators to photo editing software & file management tools.',
    content: `<p>Looking for the best free graphic design tools? We’ve done the research so you don’t have to. Check out this list containing some of the best tools for creating professional designs without the professional price tags.</p>
<p>The difficulty levels of the tools varies from motivated amateurs to perfectionist professionals, so you can choose the graphic design software that suits your needs and level.</p>
<p>This post will break down the graphic design software tools into 10 useful categories, from AI image generators to file management tools.</p>
<h2>AI image generators</h2>
<p>Text-to-image generators are a hot topic that’s taking off in 2023. Artificial intelligence is changing the way we approach graphic design, and proving to be controversial in its journey.</p>
<p>These powerful tools use machine learning algorithms to create unique and eye-catching graphics in just a few clicks. Whether you're looking to generate patterns, logos, or photo-realistic images - AI image generators are captivating creative tools.</p>
<p>The software might not give you the perfect professional results every time as we are still in the early stages of this AI explosion. Nevertheless, these tools show incredible potential and can be used for content creation or to push your ideas and imagination to the max.</p>
<h3>DALL-E from OpenAI</h3>
<p>DALL-E from OpenAI (the same people who made the headline-smashing ChatGPT) is a clear front-runner in the race for AI image generators. The free AI image tool is great at taking precise inputs to create multiple variations that let you select the best from the bunch.</p>
<p>It’s most effective when choosing a style for the images, for example an expressive oil painting, a pencil drawing, or a watercolor painting. This feature makes it possible to create unique, professional-looking images with ease.</p>
<p>The software is being updated and improved on a regular basis, so keep watching these AI image generators as many changes and new features are undoubtedly around the corner.</p>
<img src="https://www.ilovepdf.com/storage/blog/205-1678104291-6.-Dalle.png" alt="DALL-E AI Image Generator" class="my-4 rounded-lg shadow-md" />
<h3>Midjourney</h3>
<p>Midjourney creates high-quality designs compared to many of its competitors, with styles that are futuristic and atmospheric. Considering the early stages of the development, like DALL-E, it’s incredible how far these tools have come in such a short amount of time with such impressive results.</p>
<p>However, despite its impressive capabilities, the biggest drawback is its usability. The process to create an image is complicated and time-consuming—you have to enter Discord, find a new “newbies channel”, and then use the “/imagine” command in a chaotic chat with images flying through the chat.</p>
<p>Aside from the difficult usability, once you have understood the process the results of this AI art generator are remarkable.</p>
<h3>DeepAI</h3>
<p>DeepAI is fun AI image generator that lacks some finishing touches. It’s a great tool to get some inspiration on specific ideas, with a simple search bar that is easy to use, and a number of free styles to choose from.</p>
<p>While the results produced by its text-to-image converter may not be as polished and professional as those produced by other AI image generators. DeepAI has a lot of potential, and is a playful tool with a number of free styles to choose from, giving users plenty to experiment with.</p>
<h2>Color palette generators</h2>
<p>This chapter is all about color. We'll explore the best free graphic design software options specifically made to help you create stunning color palettes.</p>
<p>Whether you're a seasoned designer or just starting out, these tools make it easy to experiment with color, select a harmonious scheme, and set the scene for your color scheme. So, let's dive in and discover the best free color palette tools.</p>
<h3>Coolors</h3>
<p>See what’s hot with trending color palettes, generate colors, and select colors from photos with this well-designed website that helps you get into the creative mood from the get-go. Coolors is easy to use and palettes are simple to export, with many options for sharing your chosen colors.</p>
<p>Whether you want to find warm color palettes and share them with your team or save them for future projects, this tool has a smooth workflow that makes it easy to work on multiple new projects while organizing the old ones.</p>
<img src="https://www.ilovepdf.com/storage/blog/205-1678103451-1.-Coolors.png" alt="Coolors Color Palette Generator" class="my-4 rounded-lg shadow-md" />
<h3>Color Space</h3>
<p>Color Space is a useful color palette generator to develop your ideas for a design that starts with a single color. Put your desired color in and the site generates a variety of color palettes including gradient and random shades.</p>
<p>It’s simple to create basic gradients, and has recently released the option to make 3 Color Gradients, which are extremely easy to edit and play around with.</p>
<p>The drawback is that you are limited in the amount of palettes that you can explore, especially if you’re starting from scratch and don’t have a color palette already in mind.</p>
<h3>Adobe Capture</h3>
<p>Adobe Capture is a color palette generator that offers ten free tasks before having to register. This is a superb mobile app that takes real-time images and lets you create a color palette from whatever you see around you.</p>
<p>The app is a useful addition that makes it easy to generate a color palette from an image, whether you choose to use a live camera view or select a saved photo. You can also create shapes and patterns as interesting artistic features.</p>
<h2>Image editing tools</h2>
<p>Photo editing is an essential aspect of graphic design. Whether it's adjusting the angle, changing the brightness and contrast, or adding special filters, having the right image editing software makes all the difference to your final results.</p>
<p>In this section, we'll explore some of the best free image editors available to help elevate your design work and give it that professional touch. Image editing tools can be difficult to use, so we've also included some that are more straightforward.</p>
<h3>iLoveIMG Editor</h3>
<p>The iLoveIMG's Photo Editor is by far the easiest of these free photo editing software. It is a simple yet versatile tool with a range of editing options that allow you to draw on images and add more image files. Users can easily crop, resize, add filters, frames, and effects to add a professional finish to designs.</p>
<p>If you’re looking for a basic photo editor that’s easy and quick to use for some basic editing, then this is the perfect option.</p>
<img src="https://www.ilovepdf.com/storage/blog/205-1678103763-2.1-iLoveIMG-Edit-tool.png" alt="iLoveIMG Photo Editor" class="my-4 rounded-lg shadow-md" />
<h3>Photopea</h3>
<p>Acting as a close alternative to Photoshop, Photopea is an online tool that provides many design features, without the need to download any expensive software.</p>
<p>It's worth pointing out that as an online tool it may run slowly if you’re working with heavy editing tasks. Also, if you are used to other editing software then it will take some time to learn its features.</p>
<p>Despite these challenges, Photopea is a fantastic free editing tool for designers who want professional features to bring their creative visions to life.</p>
<img src="https://www.ilovepdf.com/storage/blog/205-1678103850-2.-Photopea.png" alt="Photopea Online Editor" class="my-4 rounded-lg shadow-md" />
<h3>GIMP</h3>
<p>GIMP is a fantastic open-source image editing software that provides powerful image editing tools and offers an impressive variety of file formats, all completely free.</p>
<p>The workspace is slightly cluttered and it can be difficult to navigate all of the features, especially for beginners, but once you’ve mastered the basics this is an amazing feature-packed photo editor and another free alternative to Photoshop.</p>
<h3>Adobe creative cloud (free trial)</h3>
<p>Adobe graphic design software isn’t the easiest if you’re just starting out, but it takes the top spot for the most in-depth software for image and video editing.</p>
<p>For professionals, this is the industry standard for quality editing, and within the Creative Cloud you have access to multiple Adobe products, including Photoshop, After Effects, and Premiere Pro just to name a few.</p>
<p>Perfect if you aren’t needing them long term, there are free trials for many of the tools. While a 7-day free trial is available, the software can be expensive if you’re looking for a longer-term editing solution.</p>
<h2>Font generators</h2>
<p>Welcome to the world of font generators. For anyone working or playing around with designs, typography plays a crucial role in making your work stand out with the right style.</p>
<p>Free font generators help you find custom typefaces for your projects without the need for extensive design knowledge and expensive font licenses. Experiment with different styles and letterforms until you find the perfect look for your design.</p>
<h3>Fontspring</h3>
<p>Fontspring offers multiple categories that help you find the right free font download. It is also simple to sort the fonts by ‘Most Favorited’ to see what’s trending, as well as 'Best Of’ lists to investigate the most popular selection from previous years.</p>
<p>Frustratingly, when browsing the fonts some are listed as containing free versions when in reality they are only available as icons, which is misleading. If you don’t mind spending time finding the free ones, this is a valuable resource.</p>
<img src="https://www.ilovepdf.com/storage/blog/205-1678105548-3.-Fontspring.png" alt="Fontspring Font Generator" class="my-4 rounded-lg shadow-md" />
<h3>WhatTheFont/MyFonts</h3>
<p>WhatTheFont (also known as MyFonts) has high-quality downloads that are searchable within useful categories. Are you trying to identify a font you’ve spotted? MyFonts can also scan an uploaded image to find and identify the font you want to identify.</p>
<p>Frustratingly, free fonts are often hidden among the paid options, requiring you to scroll through the listings to download the font you need. Despite this, MyFonts remains a great tool for anyone looking for a free font generator.</p>
<h3>Google Fonts</h3>
<p>Google Fonts provides an extremely popular free font browser that offers typography in multiple languages and design styles. There is a user-friendly interface that offers fonts that are free for personal and commercial use.</p>
<p>A drawback is that the range of types is not as diverse as other font browsers, with limited options within a chosen fonts style. If you're looking for a more specific font style, you may need to look elsewhere.</p>
<h2>Icon downloads</h2>
<p>Icons play a critical role in creating a professional and polished look for websites, mobile applications, and other digital platforms. In this section, we'll be exploring the best free icon downloads so you can find the perfect designs for your next project.</p>
<p>From modern designs and classic looks to simple social media icon downloads - the ability to browse and use royalty-free icons is key for any digital designer or marketer looking to create a cohesive brand experience.</p>
<p>We've compiled a list of the top free graphic design software that gives you quality icon libraries to complement your designs.</p>
<h3>Flaticon</h3>
<p>Flaticon gives users a robust library of high-quality designs, where you can find PNG, SVG, Android, and iOS versions of the most popular fonts. Selected fonts also have different styles with changing colors and contrast.</p>
<p>Free users are restricted to downloading certain icons as a PNG, and the SVG version of the icon is sometimes only available with the Premium service.</p>
<img src="https://www.ilovepdf.com/storage/blog/205-1678105567-4.-Flaticon.png" alt="Flaticon Icon Downloads" class="my-4 rounded-lg shadow-md" />
<h3>Noun Project</h3>
<p>The Noun Project is a well-designed platform that offers a more creative and inclusive range of free icons to what we’re used to.</p>
<p>With its user-friendly interface, easily find individual icons or browse through various icon collections to find the perfect fit for your project.</p>
<p>The basic free download option only provides icons in black, but the premium downloads are cost-effective and allow for more customization. If you’re looking for basic but creative and inclusive icons, then Noun Project is a great choice.</p>
<h3>Google Icons within Fonts</h3>
<p>We’re back to Google Fonts, but this time for downloading free icons. Google Icons offers an extensive library of high-quality icons that are perfect for UI design, allowing for the customization of Fill, Weight, Grade, and Optical Size.</p>
<p>Icons are available in SVG or PNG formats for download, as well as the information on the 'Variable Icon Font' configuration for CSS, making it easy for designers to integrate their icons into their web projects.</p>
<h2>3D & 2D Animation software</h2>
<p>Bring your ideas to life with 3D and 2D Animation software. Whether you're creating a short clip for a commercial, designing characters for a video game, or adding some movement to your graphics - free animation software takes your designs to the next level.</p>
<p>We’ve found some of the best animation software that published professionals and aspiring amateurs can all enjoy.</p>
<h3>Blender</h3>
<p>Boasting an intuitive interface, Blender animation software is a widely acclaimed free and open-source tool that’s best for intermediate or professional animators.</p>
<p>It’s loved for its 3D pipeline editing, including 3D and 2D animation, and has an impressive array of animation features that you’d expect to see in the best premium animators.</p>
<p>Despite some occasional lag and slow render times, the software is regularly updated and continues to receive improvements, making it one of the best free animation software options available.</p>
<p>With its versatile tools, Blender is widely used in the creation of animations, models, and artwork, providing a one-stop solution for artists and designers.</p>
<img src="https://www.ilovepdf.com/storage/blog/205-1678105658-5.-Blender.png" alt="Blender 3D Animation Software" class="my-4 rounded-lg shadow-md" />
<h3>OpenToonz</h3>
<p>Used in the creation of many acclaimed animated productions, including Studio Ghibli's "Princess Mononoke", OpenToonz is a powerful and versatile open-source 2D animation tool that is suitable for both commercial and non-commercial projects.</p>
<p>With its user-friendly interface and extensive feature set, OpenToonz is accessible to animators of all skill levels, from beginners to professionals. The software is also compatible with TWAIN standards, allowing animators to easily scan and import hand-drawn artwork for use in their animations.</p>
<p>The software may take some time to learn for beginners, and has some limitations in its vector drawing tools.</p>
<h3>Synfig</h3>
<p>Synfig is a powerful open-source 2D animation tool that offers a wide range of features to help animators create professional-quality animations.</p>
<p>With its support for multiple layers, vector tweening, and bones system, Synfig is an excellent choice for animators who want to create complex and dynamic animations. The software also provides a variety of special effects and filters that can be used to enhance the visual appeal of animations.</p>
<p>While the software has a large community of users and developers, some users have reported occasional instability and performance issues.</p>
<h2>Design tools</h2>
<p>No matter what your creative project is, from logos and presentations to social media posts and videos, a powerful design tool is essential to your success. With so many options available, it can be difficult to know where to start.</p>
<p>In this section, we'll be highlighting the best design tools to help you create stunning designs. From the well-known to the less well-known, we’ve found the best free design tools to help you create your next masterpiece.</p>
<h3>Canva</h3>
<p>Canva is a user-friendly design tool that offers a wide range of templates for various projects, from social media graphics and presentations to logos and websites. With its intuitive drag-and-drop interface, Canva makes it easy to create beautiful designs without any design experience.</p>
<p>Canva also provides a huge library of stock images, videos, and audio tracks that can be used to enhance your designs. You can also collaborate with your team in real-time and share your designs with ease.</p>
<h3>Figma</h3>
<p>Figma is a cloud-based design tool that allows for real-time collaboration between team members. It’s perfect for creating vector-based graphics and has features like the Arc tool and Vector Networks to help your creative ideas flow.</p>
<p>While Figma is a powerful design tool, it is better suited for smaller projects due to its cloud-based limitations, and can be difficult for beginners to pick up.</p>
<p>Whether you're working on a small or large project, Figma's powerful design features and collaborative capabilities make it an excellent choice for teams of all sizes.</p>
<img src="https://www.ilovepdf.com/storage/blog/205-1678105707-7.-Figma.png" alt="Figma Design Tool" class="my-4 rounded-lg shadow-md" />
<h3>Vectr</h3>
<p>Vectr is a free, web-based vector graphics editor that is perfect for creating simple and clean vector graphics.</p>
<p>With its easy-to-use interface, Vectr is an excellent choice for beginners who are just starting out with vector graphics. It also provides a variety of tutorials and guides to help you get started.</p>
<p>While Vectr may not be as feature-rich as other vector graphics editors, its simplicity and ease of use make it a great option for creating basic vector graphics.</p>
<h3>DesignWizard</h3>
<p>DesignWizard is an online graphic design tool that has a large library of templates and over 1 million images to create high-quality designs. With a simple and clean interface that’s easy to use for beginners, it has some great basic features for both videos and images.</p>
<p>Unfortunately, most of the templates and features are only available with the paid version, and there is a limit on the number of free downloads.</p>
<h3>Snappa</h3>
<p>Snappa is a super simple online design tool that’s aimed at non-designers working on quick projects like social media posts and blog images. It has a basic, but effective, background removal tool that is free to use.</p>
<p>While Snappa is easy to use and a great choice for quick projects, it’s not for detailed design work. There is also a limit to the number of free downloads per month.</p>
<h2>File management software</h2>
<p>Are you a graphic designer looking for a way to manage your files? With so many documents and versions to keep track of, it's essential to have a system in place to keep your designs and assets organized and accessible.</p>
<p>In this section, we'll be exploring the best free file management software for graphic designers. We've compiled a list of the top options that offer features like version control, cloud storage, and collaboration tools.</p>
<h3>iLovePDF</h3>
<p>iLovePDF is an all-in-one file management software that provides a wide range of tools to help you manage your PDF files. With its easy-to-use interface, iLovePDF allows you to merge, split, compress, and convert your PDFs with ease.</p>
<p>The software is also integrated with Google Drive and Dropbox, making it easy to access your files from anywhere. With its batch processing capabilities, iLovePDF is a great choice for managing large volumes of PDF files.</p>
<p>While the focus is on PDFs, it has a separate website called iLoveIMG that is dedicated to editing images. They are both free, but premium plans are available to unlock more features.</p>
<img src="https://www.ilovepdf.com/storage/blog/205-1678105780-8.-iLovePDF.png" alt="iLovePDF File Management" class="my-4 rounded-lg shadow-md" />
<h3>Google Drive</h3>
<p>Google Drive is a cloud-based file storage and synchronization service that offers 15GB of free storage. It allows you to store, share, and collaborate on files and folders from any device, anywhere.</p>
<p>With its integration with other Google services like Docs, Sheets, and Slides, Google Drive is an excellent choice for managing your work documents.</p>
<p>While Google Drive is a great option for personal use, it may not be suitable for managing large volumes of files due to its storage limitations.</p>
<h3>Dropbox</h3>
<p>Dropbox is another popular cloud-based file storage service that offers 2GB of free storage. It’s a great option for sharing and collaborating on files with your team.</p>
<p>Dropbox also has a desktop app that allows you to sync your files between your computer and the cloud. While Dropbox is a great option for personal use, it may not be suitable for managing large volumes of files due to its storage limitations.</p>
<h2>Screenshot and annotation tools</h2>
<p>Whether you're a designer, developer, or marketer, you know how important it is to be able to capture and communicate your ideas clearly. That's where screenshot and annotation tools come in handy.</p>
<p>With the right tools, you can easily capture screenshots, add annotations, and share them with your team. In this section, we'll be exploring the best free screenshot and annotation tools that are available for graphic designers.</p>
<h3>Lightshot</h3>
<p>Lightshot is a free screenshot tool that allows you to quickly capture and edit screenshots. With its simple and intuitive interface, Lightshot is a great choice for both beginners and professionals.</p>
<p>Lightshot also provides a variety of editing tools, including a text tool, a pen tool, and a shape tool. You can also upload your screenshots to the cloud and share them with your team.</p>
<h3>Snagit</h3>
<p>Snagit is a powerful screenshot and screen recording tool that offers a wide range of features. With its all-in-one capture feature, Snagit allows you to capture your entire screen, a specific window, or a scrolling window.</p>
<p>Snagit also provides a variety of editing tools, including a text tool, a callout tool, and a shape tool. You can also add effects like borders, shadows, and torn edges to your screenshots.</p>
<p>While Snagit is a powerful tool, it may be overwhelming for beginners. It also has a free trial, but the full version is paid.</p>
<img src="https://www.ilovepdf.com/storage/blog/205-1678105822-9.-Snagit.png" alt="Snagit Screenshot Tool" class="my-4 rounded-lg shadow-md" />
<h3>Awesome Screenshot</h3>
<p>Awesome Screenshot is a free screenshot and screen recording tool that is available as a browser extension. It allows you to capture your entire screen, a specific window, or a scrolling window.</p>
<p>Awesome Screenshot also provides a variety of editing tools, including a text tool, a pen tool, and a shape tool. You can also add annotations like arrows, circles, and rectangles to your screenshots.</p>
<p>While Awesome Screenshot is a great option for capturing and editing screenshots, it may not be as feature-rich as other screenshot tools.</p>
<h2>Mockup generators</h2>
<p>Mockup generators are an essential tool for graphic designers who want to showcase their work in a professional and realistic way. With a mockup generator, you can easily create mockups of your designs for various devices and products.</p>
<p>In this section, we'll be exploring the best free mockup generators that are available for graphic designers. We've compiled a list of the top options that offer a wide range of templates and features.</p>
<h3>Smartmockups</h3>
<p>Smartmockups is a free mockup generator that offers a wide range of templates for various devices and products. With its easy-to-use interface, Smartmockups is a great choice for both beginners and professionals.</p>
<p>Smartmockups also allows you to customize your mockups with your own images and designs. You can also choose from a variety of backgrounds and colors to create the perfect mockup.</p>
<h3>MockupsJar</h3>
<p>MockupsJar is a free mockup generator that offers a wide range of templates for various devices and products. With its simple and intuitive interface, MockupsJar is a great choice for beginners.</p>
<p>MockupsJar also allows you to customize your mockups with your own images and designs. You can also choose from a variety of backgrounds and colors to create the perfect mockup.</p>
<h3>House of Mockups</h3>
<p>House of Mockups is a free mockup generator that offers a wide range of templates for various devices and products. With its high-quality templates, House of Mockups is a great choice for professionals.</p>
<p>House of Mockups also allows you to customize your mockups with your own images and designs. You can also choose from a variety of backgrounds and colors to create the perfect mockup.</p>
<img src="https://www.ilovepdf.com/storage/blog/205-1678105891-10.-House-of-mockups.png" alt="House of Mockups" class="my-4 rounded-lg shadow-md" />
`,
    image: 'https://www.ilovepdf.com/storage/blog/205-1678105942-Best-free-graphic-design-software.jpg',
    author: 'The I Love PDFLY Team',
    authorImage: 'https://ik.imagekit.io/fonepay/I%20lovePDLY%20logo.PNG?updatedAt=1753104228877',
    tags: ['Graphic Design', 'Free Software', 'Design Tools', 'Productivity', 'Creative'],
    },
];