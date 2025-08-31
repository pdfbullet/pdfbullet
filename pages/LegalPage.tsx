
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LockIcon, ProtectIcon, GavelIcon, CookieIcon } from '../components/icons.tsx';

const LegalCard: React.FC<{ icon: React.FC<any>, title: string, description: string, link: string }> = ({ icon: Icon, title, description, link }) => (
    <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col items-center text-center h-full hover:-translate-y-1 transition-transform duration-300">
        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4">
            <Icon className="h-8 w-8 text-brand-red" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400 flex-grow">{description}</p>
        <Link to={link} className="mt-6 font-semibold text-brand-red hover:underline">
            See more
        </Link>
    </div>
);


const LegalPage: React.FC = () => {
    useEffect(() => {
        document.title = "Legal Information | I Love PDFLY";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "Find all legal information for iLovePDFLY, including our data security standards, privacy policy, terms of service, and cookie policy.");
        }
    }, []);

    const legalSections = [
        {
            icon: LockIcon,
            title: 'Security',
            description: 'iLovePDFLY is certified for meeting the requirements established by the international standard ISO/IEC 27001.',
            link: '/security-policy'
        },
        {
            icon: ProtectIcon,
            title: 'Privacy',
            description: 'Files you upload and process are encrypted and deleted from our servers within 2 hours, protecting your data and privacy.',
            link: '/privacy-policy'
        },
        {
            icon: GavelIcon,
            title: 'Terms',
            description: 'Here are the rules you must follow to get your work done in iLovePDFLY. By using iLovePDFLY, you agree to our Terms and Conditions.',
            link: '/terms-of-service'
        },
        {
            icon: CookieIcon,
            title: 'Cookies',
            description: 'As per European Law, we\'re happy to tell you exactly what cookies we\'re using and what they do. You can see what those are by clicking below!',
            link: '/cookies-policy'
        }
    ];

    return (
        <div className="py-16 md:py-24 bg-gray-50 dark:bg-black">
            <div className="px-6">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">Data Security and Privacy policies</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        In-depth insight into iLovePDFLY's Privacy and Security Framework
                    </p>
                </div>

                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    {legalSections.map(section => (
                        <LegalCard key={section.title} {...section} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LegalPage;
