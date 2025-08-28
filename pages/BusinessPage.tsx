import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    ApiIcon, BatchProcessingIcon, BuildingIcon, ChainedTasksIcon, CheckIcon, DollarIcon, EditIcon, GavelIcon, 
    HeartbeatIcon, TrendingUpIcon, UsersIcon
} from '../components/icons.tsx';

const BusinessPage: React.FC = () => {
    const [activeIndustry, setActiveIndustry] = useState('hr');

    useEffect(() => {
        document.title = "Business Solutions | I Love PDFLY";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "Discover how I Love PDFLY can streamline document workflows for your business. Explore solutions for HR, legal, finance, and more with our secure and efficient tools.");
        }
    }, []);

    const industries = {
        hr: {
            name: "Human Resources",
            icon: UsersIcon,
            content: {
                points: [
                    { title: "Document Management", text: "HR professionals often handle a high volume of documents such as resumes, contracts, and employee records. I Love PDFLY allows easy merging, splitting, and annotating of PDFs, streamlining document management." },
                    { title: "E-Signatures", text: "The e-Sign feature simplifies the onboarding process by enabling quick and secure electronic signing of employment contracts and other HR-related documents." }
                ],
                image: "https://www.ilovepdf.com/img/business/industries/hr.png"
            }
        },
        legal: { name: "Legal", icon: GavelIcon, content: { points: [{ title: "Case Management", text: "Legal teams can organize case files, redact sensitive information, and add bates numbering to legal documents efficiently." }], image: "https://www.ilovepdf.com/img/business/industries/legal.png" } },
        finance: { name: "Finance", icon: DollarIcon, content: { points: [{ title: "Report Generation", text: "Convert Excel sheets to professional-looking PDFs and protect sensitive financial reports with strong encryption." }], image: "https://www.ilovepdf.com/img/business/industries/financial.png" } },
        realEstate: { name: "Real Estate", icon: BuildingIcon, content: { points: [{ title: "Contract Handling", text: "Easily sign property contracts, merge property documents, and share them securely with clients and stakeholders." }], image: "https://www.ilovepdf.com/img/business/industries/estate.png" } },
        sales: { name: "Sales", icon: TrendingUpIcon, content: { points: [{ title: "Proposal Creation", text: "Create and manage sales proposals, compress them for easy emailing, and track them with e-signatures." }], image: "https://www.ilovepdf.com/img/business/industries/sales.png" } },
        healthcare: { name: "Healthcare", icon: HeartbeatIcon, content: { points: [{ title: "Patient Records", text: "Securely manage patient records, ensuring HIPAA compliance with password protection and redaction tools." }], image: "https://www.ilovepdf.com/img/business/industries/health.png" } }
    };

    return (
        <div className="bg-white dark:bg-black text-gray-800 dark:text-gray-200">
            {/* Hero Section */}
            <section className="py-20 md:py-28 bg-gray-50 dark:bg-black">
                <div className="px-6">
                    <div className="grid lg:grid-cols-5 gap-12 items-center">
                        <div className="lg:col-span-2 text-center lg:text-left">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">
                                Simplify document management with I Love PDFLY
                            </h1>
                            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">
                                Efficient, reliable, and secure solutions for all your PDF needs – empower your business with seamless PDF integration and collaboration tools.
                            </p>
                            <div className="mt-10">
                                <Link to="/pricing" className="inline-block bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
                                    Get Started
                                </Link>
                            </div>
                        </div>
                        <div className="lg:col-span-3">
                            <img 
                                src="https://www.ilovepdf.com/img/business/business.png" 
                                alt="Simplify document management with I Love PDFLY" 
                                className="w-full h-auto rounded-lg shadow-2xl"
                                width="570" height="427" loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Features Section */}
             <section className="py-20">
                <div className="px-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-gray-50 dark:bg-black p-6 rounded-xl shadow-md text-center">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                               <EditIcon className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold">Advanced PDF Editing</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Directly edit text, and other content within PDF documents.</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-black p-6 rounded-xl shadow-md text-center">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                               <BatchProcessingIcon className="h-8 w-8 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold">Batch Processing</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Process heavy tasks in bulk with Desktop App.</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-black p-6 rounded-xl shadow-md text-center">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                               <ChainedTasksIcon className="h-8 w-8 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold">Chained tasks</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Speed up complex workflows by chaining multiple document tasks together.</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-black p-6 rounded-xl shadow-md text-center">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
                               <ApiIcon className="h-8 w-8 text-purple-500" />
                            </div>
                            <h3 className="text-xl font-bold">Document Processing API</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Automate tasks like converting, and e-Signing directly through a robust API.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* All-in-one Platform section */}
             <section className="py-20 bg-gray-50 dark:bg-black">
                <div className="px-6">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold">Your all-in-one platform for your document needs</h2>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-2xl">
                            <h3 className="text-2xl font-bold mb-4">One platform to work easily</h3>
                            <img src="https://www.ilovepdf.com/img/business/platform.png" alt="Platform UI screenshot" className="rounded-lg shadow-md w-full h-auto" width="555" height="427" loading="lazy"/>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-2xl">
                            <h3 className="text-2xl font-bold mb-4">Reshaping productivity for your Business</h3>
                            <img src="https://www.ilovepdf.com/img/business/productivity.png" alt="Productivity UI screenshot" className="rounded-lg shadow-md w-full h-auto" width="555" height="427" loading="lazy"/>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Enterprise section */}
             <section className="py-20">
                 <div className="px-6">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold">Designed for enterprise</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-gray-50 dark:bg-black p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
                             <img src="https://www.ilovepdf.com/img/business/workflows.png" alt="Streamline workflows illustration" className="rounded-lg mb-6 w-full h-auto" width="350" height="270" loading="lazy"/>
                             <h3 className="text-2xl font-bold mb-4">Streamline workflows</h3>
                             <ul className="space-y-2 list-disc list-inside text-gray-600 dark:text-gray-400">
                                 <li>Batch-process documents to save time and improve efficiency.</li>
                                 <li>Integrate with Google Drive and Dropbox for seamless productivity.</li>
                             </ul>
                        </div>
                        <div className="bg-gray-50 dark:bg-black p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
                             <img src="https://www.ilovepdf.com/img/business/ai.png" alt="Optimize work with AI illustration" className="rounded-lg mb-6 w-full h-auto" width="350" height="270" loading="lazy"/>
                             <h3 className="text-2xl font-bold mb-4">Optimize work with AI</h3>
                             <ul className="space-y-2 list-disc list-inside text-gray-600 dark:text-gray-400">
                                 <li>Extract text from scanned files using AI-powered OCR.</li>
                                 <li>Automate tasks and enhance output with AI-driven tools.</li>
                             </ul>
                        </div>
                        <div className="bg-gray-50 dark:bg-black p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
                             <img src="https://www.ilovepdf.com/img/business/security-level.png" alt="Enterprise level security illustration" className="rounded-lg mb-6 w-full h-auto" width="350" height="270" loading="lazy"/>
                             <h3 className="text-2xl font-bold mb-4">Enterprise level security</h3>
                             <ul className="space-y-2 list-disc list-inside text-gray-600 dark:text-gray-400">
                                 <li>Protect data with end-to-end encryption.</li>
                                 <li>Ensure compliance with GDPR, HIPAA, and other standards.</li>
                             </ul>
                        </div>
                    </div>
                 </div>
            </section>

            {/* Industry Solutions section */}
            <section className="py-20 md:py-28 bg-gray-50 dark:bg-black">
                <div className="px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-extrabold">Discover how I Love PDFLY simplifies document management for your business sector</h2>
                    </div>
                    <div className="mt-16">
                        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
                            {Object.entries(industries).map(([key, { name, icon: Icon }]) => (
                                <button key={key} onClick={() => setActiveIndustry(key)} className={`flex items-center gap-3 px-4 py-2 rounded-full font-semibold transition-colors ${activeIndustry === key ? 'bg-brand-red text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700'}`}>
                                    <Icon className="h-5 w-5" />
                                    <span>{name}</span>
                                </button>
                            ))}
                        </div>
                        <div className="mt-8 bg-red-50 dark:bg-red-900/20 p-8 rounded-xl">
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div className="order-2 md:order-1">
                                    <h3 className="text-2xl font-bold mb-4">{industries[activeIndustry as keyof typeof industries].name}</h3>
                                    <div className="space-y-4">
                                        {industries[activeIndustry as keyof typeof industries].content.points.map((point, i) => (
                                            <div key={i}>
                                                <h4 className="font-semibold text-lg flex items-center gap-2"><CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" /> {point.title}</h4>
                                                <p className="text-gray-600 dark:text-gray-400 pl-7">{point.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="order-1 md:order-2">
                                    <img src={industries[activeIndustry as keyof typeof industries].content.image} alt={industries[activeIndustry as keyof typeof industries].name} className="rounded-lg shadow-md w-full h-auto" width="555" height="427" loading="lazy"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* API and CTA */}
            <section className="py-20">
                <div className="px-6">
                    <div className="bg-brand-red text-white p-12 rounded-xl text-center shadow-lg">
                        <ApiIcon className="h-12 w-12 mx-auto mb-4" />
                        <h2 className="text-3xl font-extrabold">Integrate our tools with your systems</h2>
                        <p className="mt-4 max-w-2xl mx-auto">
                           Unlock the full potential of I Love PDFLY with our powerful API. Automate document workflows, integrate our tools into your own applications, and scale your operations with ease.
                        </p>
                        <div className="mt-8">
                             <Link to="/developer" className="bg-white text-brand-red font-bold py-3 px-8 rounded-lg text-lg transition-colors hover:bg-gray-100">
                                Explore Our API
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BusinessPage;