

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const faqData = [
  {
    question: "Is ILovePDFLY completely free?",
    answer: <p>Yes! Most of our tools are 100% free for standard use. We offer <Link to="/pricing" className="text-brand-red hover:underline">Premium plans</Link> for users who need advanced features like unlimited processing, larger file sizes, and an ad-free experience.</p>
  },
  {
    question: "Are my files secure?",
    answer: <p>Absolutely. We prioritize your privacy and security. All file transfers are protected with end-to-end SSL encryption. For most tools, processing happens directly in your browser, meaning your files never even reach our servers. You can read more in our <Link to="/privacy-policy" className="text-brand-red hover:underline">Privacy Policy</Link>.</p>
  },
  {
    question: "Do you keep a copy of my processed files?",
    answer: <p>No, we do not keep your files. For the few tools that require server processing, all uploaded and processed files are automatically and permanently deleted from our servers within two hours. Our goal is to provide the tools, not to store your data.</p>
  },
  {
    question: "Are company files safe with your service?",
    answer: <p>Yes. We take security very seriously. In addition to SSL encryption and automatic file deletion, we offer our Desktop App for maximum security. It processes files completely offline on your own computer, ensuring sensitive company documents never leave your local environment.</p>
  },
  {
    question: "Do I need to install any software?",
    answer: <p>No installation is required. ILovePDFLY is a fully online service that works directly in your web browser on any operating system. For users who prefer offline work, we also offer optional Desktop and Mobile apps.</p>
  },
  {
    question: "What are your system requirements?",
    answer: <p>ILovePDFLY is a web-based application, which means it works on any modern web browser (like Chrome, Firefox, Safari, Edge) on any operating system (Windows, Mac, Linux, etc.). There are no specific system requirements other than a stable internet connection and an up-to-date browser.</p>
  },
  {
    question: "How can I upload my files?",
    answer: <p>You can upload files in several ways. You can click the 'Select Files' button to choose files from your computer, or you can simply drag and drop your files into the designated area on the tool page. We also support uploading files directly from Google Drive and Dropbox for your convenience.</p>
  },
  {
    question: "Can I work from the cloud?",
    answer: <p>Yes! We offer integrations with Google Drive and Dropbox. You can select files directly from your cloud storage accounts to process them with our tools, and then save the processed files back to the cloud. This allows for a seamless workflow without needing to download and re-upload files.</p>
  },
  {
    question: "Can I convert my scanned PDFs to an editable document?",
    answer: <p>Yes, you can. Our <Link to="/ocr-pdf" className="text-brand-red hover:underline">OCR PDF tool</Link> is designed for this purpose. It uses Optical Character Recognition (OCR) technology to analyze the text in your scanned document or image and convert it into an editable format, like a searchable PDF. For the best results, ensure your scanned document is high quality.</p>
  },
  {
    question: "Why does my conversion take so long?",
    answer: <p>Conversion time can vary depending on several factors, including the size of your file, the complexity of the document (e.g., number of pages, images), and your own computer's processing power, as many tools run locally in your browser. For larger files or complex operations like OCR, please be patient as the tool works to provide the best quality output.</p>
  },
  {
    question: "Why did I not receive the confirmation of my email address?",
    answer: <p>If you have not received your email confirmation after signing up, please check your spam or junk mail folder first. If you still can't find it, you can try resending the confirmation from your <Link to="/account-settings" className="text-brand-red hover:underline">account settings</Link> or <Link to="/contact" className="text-brand-red hover:underline">contact our support team</Link> for assistance. Also, ensure you entered your email address correctly without any typos.</p>
  },
  {
    question: "What types of files can I upload?",
    answer: <p>Our tools support a wide variety of file formats depending on the task. For conversions to PDF, you can use Word, Excel, PowerPoint, JPG, PNG, and HTML files. For conversions from PDF, we support Word, PowerPoint, Excel, and JPG formats. Most tools, like <Link to="/merge-pdf" className="text-brand-red hover:underline">Merge PDF</Link> or <Link to="/compress-pdf" className="text-brand-red hover:underline">Compress PDF</Link>, work directly with PDF files.</p>
  },
  {
    question: "Are there any limitations on file size or usage?",
    answer: <p>For our free service, we aim to provide generous limits that satisfy the needs of most users. However, there might be some limitations on file size or the number of tasks per hour to ensure stable service for everyone. For heavy-duty use, consider our <Link to="/pricing" className="text-brand-red hover:underline">Premium plans</Link> which offer higher limits.</p>
  }
];

const getAnswerText = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (node === null || typeof node === 'boolean' || node === undefined) return '';
    if (Array.isArray(node)) return node.map(getAnswerText).join('');
    // FIX: Cast node.props to 'any' to safely access the 'children' property.
    // The 'React.isValidElement' check ensures 'node' is a React element, so 'props' will exist.
    if (React.isValidElement(node) && (node.props as any).children) {
        return getAnswerText((node.props as any).children);
    }
    return '';
};


const AccordionItem: React.FC<{
    item: { question: string, answer: React.ReactNode },
    isOpen: boolean,
    toggle: () => void,
}> = ({ item, isOpen, toggle }) => (
    <div className="border-b border-gray-200 dark:border-gray-700 py-5">
        <button onClick={toggle} className="w-full flex justify-between items-center text-left focus:outline-none">
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">{item.question}</span>
            <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </span>
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed pr-4">{item.answer}</div>
        </div>
    </div>
);


const FaqPage: React.FC = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    useEffect(() => {
        document.title = "FAQ - Frequently Asked Questions | I Love PDFLY";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "Find answers to frequently asked questions about I Love PDFLY's tools, security, and usage. Get help with merging, splitting, compressing PDFs, and more.");
        }

        // Add FAQPage JSON-LD schema for SEO
        const scriptId = 'faq-schema-page';
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;
        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqData.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": getAnswerText(faq.answer)
                }
            }))
        });

        return () => {
            const scriptToRemove = document.getElementById(scriptId);
            if (scriptToRemove) {
                scriptToRemove.remove();
            }
        };
    }, []);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="bg-gray-50 dark:bg-black py-16 md:py-24 overflow-x-hidden">
            <div className="px-6">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">Frequently Asked Questions</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Find answers to the most common questions about our tools and services.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto bg-white dark:bg-black p-6 md:p-10 rounded-lg shadow-lg">
                    {faqData.map((item, index) => (
                        <AccordionItem
                            key={index}
                            item={item}
                            isOpen={openFaq === index}
                            toggle={() => toggleFaq(index)}
                        />
                    ))}
                </div>
                 <div className="mt-12 text-center">
                    <p className="text-lg text-gray-600 dark:text-gray-300">Can't find an answer? <Link to="/contact" className="text-brand-red font-semibold hover:underline">Contact us</Link>.</p>
                </div>
            </div>
        </div>
    );
};

export default FaqPage;
