
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LockIcon } from '../components/icons.tsx';

const SecurityPolicyPage: React.FC = () => {
    useEffect(() => {
        document.title = "Data Security | I Love PDFLY";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "Learn about iLovePDFLY's commitment to data security, including HTTPS encryption and our strict data handling policies.");
        }
    }, []);

    return (
        <div className="py-16 md:py-24 bg-white dark:bg-black">
            <div className="px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">
                        The security of your data is our #1 priority
                    </h1>
                    <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        All files uploaded to iLovePDFLY are encrypted using Hypertext Transfer Protocol Secure (HTTPS).
                        iLovePDFLY does not access, use, analyze or store any processed data. If you want to know more about
                        iLovePDFLY's data collection, read our <Link to="/privacy-policy" className="text-brand-red font-semibold hover:underline">Privacy Policy</Link>.
                    </p>
                    <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-x-16 gap-y-8 text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-lg">ISO 27001</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <LockIcon className="h-6 w-6"/>
                           <span>SECURE SSL ENCRYPTION</span>
                        </div>
                         <div className="flex items-center gap-3">
                           <span className="font-bold">PDF association</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityPolicyPage;
