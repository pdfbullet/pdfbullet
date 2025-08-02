
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const faqData = [
  {
    question: "Is ILovePDFLY completely free?",
    answer: "Yes! All our tools are 100% free to use. We aim to make PDF processing accessible to everyone without hidden costs or feature limitations."
  },
  {
    question: "Are my files secure?",
    answer: "Absolutely. We prioritize your privacy and security. All files you upload are processed using end-to-end encryption and are automatically and permanently deleted from our servers within a few hours. We don't read, copy, or share your content."
  },
  {
    question: "Do I need to install any software?",
    answer: "No installation is required. ILovePDFLY is a fully online service that works directly in your web browser on any operating system. For users who prefer offline work, we also offer optional Desktop and Mobile apps."
  },
  {
    question: "What types of files can I upload?",
    answer: "Our tools support a wide variety of file formats depending on the task. For conversions to PDF, you can use Word, Excel, PowerPoint, JPG, PNG, and HTML files. For conversions from PDF, we support Word, PowerPoint, Excel, and JPG formats. Most tools, like Merge or Compress, work directly with PDF files."
  },
  {
    question: "Are there any limitations on file size or usage?",
    answer: "For our free service, we aim to provide generous limits that satisfy the needs of most users. However, there might be some limitations on file size or the number of tasks per hour to ensure stable service for everyone. For heavy-duty use, consider our future Premium plans."
  },
  {
    question: "How does the 'Unlock PDF' tool work?",
    answer: "The 'Unlock PDF' tool is designed to remove owner passwords that restrict actions like printing, copying, or editing. It cannot remove user passwords required to open a file. Please ensure you have the legal right to remove the protection from any file you upload."
  },
  {
    question: "What is OCR PDF?",
    answer: "OCR (Optical Character Recognition) is a technology that converts scanned documents or images of text into machine-readable, editable, and searchable data. Our OCR PDF tool allows you to make your scanned PDFs fully functional documents."
  },
];

const AccordionItem: React.FC<{
    item: { question: string, answer: string },
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
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed pr-4">{item.answer}</p>
        </div>
    </div>
);


const FaqPage: React.FC = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useEffect(() => {
        document.title = "FAQ - Frequently Asked Questions | I Love PDFLY";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "Find answers to frequently asked questions about I Love PDFLY's tools, security, and usage. Get help with merging, splitting, compressing PDFs, and more.");
        }
    }, []);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="bg-gray-50 dark:bg-black py-16 md:py-24 overflow-x-hidden">
            <div className="container mx-auto px-6">
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