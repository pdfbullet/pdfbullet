
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TOOLS } from '../constants.ts';
import { useI18n } from '../contexts/I18nContext.tsx';

const toolGuides: Record<string, { purpose: string; steps: string[] }> = {
    'merge-pdf': {
        purpose: 'Combine multiple PDF files into a single, ordered document.',
        steps: [
            'Click the "Select Files" button or drag and drop all the PDFs you want to merge.',
            'In the preview area, drag the file thumbnails to arrange them in your desired order.',
            'Click the "Merge PDF" button to combine the files.',
            'Download your merged PDF file.'
        ]
    },
    'split-pdf': {
        purpose: 'Divide a single PDF into multiple smaller files or extract specific pages.',
        steps: [
            'Upload the PDF you want to split.',
            'Choose a split mode: "Split by range" to define custom page ranges, or "Extract pages" to select individual pages.',
            'Configure your ranges or select your pages in the options panel.',
            'Click the "Split PDF" button to process the file.',
            'Download your resulting PDF files, which will be provided in a ZIP archive.'
        ]
    },
    'compress-pdf': {
        purpose: 'Reduce the file size of your PDF documents for easier sharing and storage.',
        steps: [
            'Select the PDF file you wish to compress.',
            'Choose a compression level: Extreme, Recommended, or Less.',
            'Click the "Compress PDF" button.',
            'Download your smaller, optimized PDF file.'
        ]
    },
    'pdf-to-word': {
        purpose: 'Convert your PDF documents into editable Microsoft Word files (DOCX).',
        steps: [
            'Upload your PDF file.',
            'Choose a conversion option: "Editable Text" for text-based editing or "Exact Copy" to preserve layout as images.',
            'For scanned documents, enable the "Use OCR" option.',
            'Click the "Convert to Word" button.',
            'Download your new Word document.'
        ]
    },
    'word-to-pdf': {
        purpose: 'Turn your Microsoft Word documents into universally readable PDF files.',
        steps: [
            'Select the Word document (DOCX) you want to convert.',
            'Our tool will instantly start the conversion process.',
            'Download your professional-quality PDF.'
        ]
    },
    'jpg-to-pdf': {
        purpose: 'Convert JPG, PNG, and other image formats into a single PDF document.',
        steps: [
            'Select one or more image files.',
            'Arrange the images in the desired order in the preview area.',
            'Adjust page size, orientation, and margins in the options panel.',
            'Click the "Convert to PDF" button.',
            'Download your new PDF document.'
        ]
    },
    'pdf-to-jpg': {
        purpose: 'Convert each page of a PDF into a separate high-quality JPG image.',
        steps: [
            'Upload your PDF file.',
            'Choose between "Convert pages" (converts each page to JPG) or "Extract images" (pulls out embedded images).',
            'Click the "Convert to JPG" button.',
            'Download your images, which will be provided in a ZIP file.'
        ]
    },
    'sign-pdf': {
        purpose: 'Sign documents yourself or request electronic signatures from others.',
        steps: [
            'Upload the PDF document you need to sign.',
            'Create your signature by typing, drawing, or uploading an image.',
            'Drag your signature and other fields (like date or text) onto the document.',
            'Click the "Sign" button to apply the signature.',
            'Download your legally binding, signed document.'
        ]
    },
    'protect-pdf': {
        purpose: 'Add a password to your PDF to protect it from unauthorized access.',
        steps: [
            'Select the PDF file you want to encrypt.',
            'Enter a strong password in the options panel.',
            'Set permissions for printing, copying, and modifying (optional).',
            'Click the "Protect PDF" button.',
            'Download your secure, password-protected PDF.'
        ]
    },
    'organize-pdf': {
        purpose: 'Visually reorder, delete, and add pages to your PDF document.',
        steps: [
            'Upload your PDF file. The pages will be displayed as thumbnails.',
            'Drag and drop pages to reorder them.',
            'Use the rotate and delete buttons on each page as needed.',
            'Click "Organize PDF" to apply the changes.',
            'Download your newly organized PDF file.'
        ]
    },
    'unlock-pdf': {
        purpose: 'Remove password protection and restrictions from your PDF files.',
        steps: [
            'Upload your password-protected PDF.',
            'Enter the correct password for the file.',
            'Click the "Unlock PDF" button.',
            'Download your unlocked, restriction-free PDF.'
        ]
    },
    'edit-pdf': {
        purpose: 'Add text, images, shapes, and annotations directly to your PDF.',
        steps: [
            'Upload your PDF file to the editor.',
            'Use the toolbar to select a tool: add text, images, or draw shapes.',
            'Click on the page to add your elements and customize them.',
            'Click "Save" to process the changes.',
            'Download your edited PDF.'
        ]
    },
    'document-scanner': {
        purpose: 'Use your device camera to scan documents and convert them to high-quality PDF files.',
        steps: [
            'Allow camera access when prompted.',
            'Point your camera at the document and click the capture button to take a picture.',
            'Capture as many pages as you need. They will appear as thumbnails.',
            'Use the filter options on each thumbnail to enhance readability (e.g., B&W, Lighten).',
            'Once you have all your pages, click "Create PDF" or "Save as JPG".',
            'Download your final PDF or JPG files from the success screen.'
        ]
    }
};

const HowToUsePage: React.FC = () => {
    const { t } = useI18n();

    useEffect(() => {
        document.title = "How to Use Our Tools | PDFBullet";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "Step-by-step guides on how to use all the PDF and image tools on PDFBullet. Learn how to merge, split, compress, convert, and more.");
        }
    }, []);

    return (
        <div className="py-16 md:py-24 bg-gray-50 dark:bg-black">
            <div className="px-6">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">How-to Guides</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Simple, step-by-step instructions for all of our powerful tools.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto space-y-12">
                    {TOOLS.map(tool => {
                        const guide = toolGuides[tool.id];
                        if (!guide) return null;

                        return (
                            <section key={tool.id} id={tool.id} className="scroll-mt-24">
                                <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`p-2 rounded-md ${tool.color}`}>
                                            <tool.Icon className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t(tool.title)}</h2>
                                            <p className="text-gray-500 dark:text-gray-400">{guide.purpose}</p>
                                        </div>
                                    </div>
                                    
                                    <ol className="list-decimal list-inside space-y-3 mt-6 text-gray-700 dark:text-gray-300">
                                        {guide.steps.map((step, index) => (
                                            <li key={index}>{step}</li>
                                        ))}
                                    </ol>
                                    
                                    <div className="mt-6">
                                        <Link to={`/${tool.id}`} className="font-semibold text-brand-red hover:underline">
                                            Go to {t(tool.title)} &rarr;
                                        </Link>
                                    </div>
                                </div>
                            </section>
                        );
                    })}
                     <div className="text-center pt-8">
                        <p className="text-gray-600 dark:text-gray-400">More guides coming soon!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowToUsePage;
