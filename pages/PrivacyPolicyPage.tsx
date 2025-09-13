import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CopyIcon } from '../components/icons.tsx';

const PrivacyPolicyPage: React.FC = () => {
    const [copiedTooltip, setCopiedTooltip] = useState<string | null>(null);

    const sectionRefs = {
        s1: useRef<HTMLDivElement>(null),
        s2: useRef<HTMLDivElement>(null),
        s3: useRef<HTMLDivElement>(null),
        s4: useRef<HTMLDivElement>(null),
        s5: useRef<HTMLDivElement>(null),
        s6: useRef<HTMLDivElement>(null),
        s7: useRef<HTMLDivElement>(null),
        s8: useRef<HTMLDivElement>(null),
        s9: useRef<HTMLDivElement>(null),
    };

     useEffect(() => {
        const scriptId = 'legal-page-schema';
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;
        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Privacy Policy",
            "url": "https://ilovepdfly.com/privacy-policy",
            "description": "I Love PDFLY's Privacy Policy outlining our procedures on the collection, use, and disclosure of your information.",
            "publisher": {
                "@type": "Organization",
                "name": "I Love PDFLY",
                "url": "https://ilovepdfly.com/"
            }
        });

        return () => {
            const scriptToRemove = document.getElementById(scriptId);
            if (scriptToRemove) {
                scriptToRemove.remove();
            }
        };
    }, []);

    const handleCopyToClipboard = (sectionId: string, ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) {
            navigator.clipboard.writeText(ref.current.innerText).then(() => {
                setCopiedTooltip(sectionId);
                setTimeout(() => setCopiedTooltip(null), 2000);
            });
        }
    };

    return (
        <div className="py-16 md:py-24 bg-gray-50 dark:bg-black">
            <div className="px-6">
                <div className="max-w-4xl mx-auto bg-white dark:bg-black p-8 md:p-12 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-8">Privacy Policy for I Love PDFLY</h1>
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                        <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
                        <p>This Privacy Policy outlines the policies and procedures of I Love PDFLY ("the Company", "we", "us", or "our") regarding the collection, use, and disclosure of your information when you use our website, https://ilovepdfly.com (the "Service"). It also informs you about your privacy rights and how the law protects you. We are deeply committed to safeguarding your privacy and ensuring the transparent handling of your data.</p>
                        
                        <div ref={sectionRefs.s1} className="relative group pt-4">
                            <h3 className="flex items-center gap-2">1. Interpretation and Definitions
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard('s1', sectionRefs.s1)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"><CopyIcon className="h-4 w-4 text-gray-500" /></button>
                                    {copiedTooltip === 's1' && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                                </div>
                            </h3>
                            <p>For the purposes of this Privacy Policy, capitalized terms have specific meanings. "Personal Data" refers to any information that relates to an identified or identifiable individual. "Service" refers to our website and all tools available on it. "You" means the individual accessing or using the Service.</p>
                        </div>

                        <div ref={sectionRefs.s2} className="relative group pt-4">
                            <h3 className="flex items-center gap-2">2. Our Core Privacy Principle: Client-Side Processing
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard('s2', sectionRefs.s2)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"><CopyIcon className="h-4 w-4 text-gray-500" /></button>
                                    {copiedTooltip === 's2' && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                                </div>
                            </h3>
                            <p>I Love PDFLY is architected with a profound commitment to your privacy. The majority of our tools operate on a client-side basis, meaning that when you use them, your files are processed directly within your web browser on your own computer. <strong>Your documents are never uploaded to our servers for these tools.</strong></p>
                            <p>For a select number of advanced features that require more computational power than a browser can provide (such as complex OCR), files are transmitted to our servers over a secure, end-to-end encrypted connection (HTTPS/TLS). These files are stored solely for the purpose of processing your request and are <strong>automatically and permanently deleted from our systems within a maximum of two hours.</strong> We do not, under any circumstances, access, analyze, copy, or share the content of your files.</p>
                        </div>

                        <div ref={sectionRefs.s3} className="relative group pt-4">
                            <h3 className="flex items-center gap-2">3. Data We Collect and Why
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard('s3', sectionRefs.s3)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"><CopyIcon className="h-4 w-4 text-gray-500" /></button>
                                    {copiedTooltip === 's3' && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                                </div>
                            </h3>
                            <p>We collect information to provide and improve our Service to you. The types of data we collect include:</p>
                            <ul>
                              <li><strong>Personal Data:</strong>
                                <ul>
                                    <li><strong>Account Information:</strong> When you register for an account, we collect a username and a securely hashed password. Providing a profile image is optional. This data is used for authentication, account management, and personalization.</li>
                                    <li><strong>Contact Information:</strong> If you contact our support, we may collect your email address and the content of your communication to assist you.</li>
                                </ul>
                              </li>
                              <li><strong>Usage Data:</strong>
                                <ul>
                                    <li>This is collected automatically and may include your device's IP address, browser type and version, the pages of our Service you visit, the time and date of your visit, the time spent on those pages, unique device identifiers, and other diagnostic data. We use this anonymous, aggregated data to monitor and improve our Service's performance and security.</li>
                                </ul>
                              </li>
                               <li><strong>Tracking Technologies and Cookies:</strong>
                                <ul>
                                    <li>We use Cookies and similar tracking technologies to track activity on our Service and store certain information. This helps us remember your preferences (like theme settings), manage your session, and understand how our Service is used. For more detailed information about the cookies we use and your choices, please see our <Link to="/cookies-policy" className="text-brand-red hover:underline">Cookie Policy</Link>.</li>
                                </ul>
                              </li>
                               <li><strong>Payment Information:</strong>
                                <ul>
                                    <li>When you subscribe to a Premium plan, your payment is processed by a secure third-party payment gateway (e.g., Fonepay). We do not collect, store, or have access to your full credit card or bank account details. We receive a confirmation token to verify the transaction and may require a proof of payment screenshot for manual account activation.</li>
                                </ul>
                              </li>
                            </ul>
                        </div>

                        <div ref={sectionRefs.s4} className="relative group pt-4">
                            <h3 className="flex items-center gap-2">4. Legal Basis for Processing Personal Data (GDPR)
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard('s4', sectionRefs.s4)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"><CopyIcon className="h-4 w-4 text-gray-500" /></button>
                                    {copiedTooltip === 's4' && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                                </div>
                            </h3>
                            <p>If you are from the European Economic Area (EEA), our legal basis for collecting and using the personal information described in this Privacy Policy depends on the Personal Data we collect and the specific context in which we collect it:</p>
                            <ul>
                                <li><strong>Consent:</strong> You have given us permission to do so.</li>
                                <li><strong>Contract:</strong> Processing your personal data is necessary for the performance of a contract with you (e.g., to provide Premium Services you have purchased).</li>
                                <li><strong>Legitimate Interests:</strong> Processing is in our legitimate interests and it's not overridden by your rights (e.g., for fraud prevention, network security, or improving our Service).</li>
                                <li><strong>Legal Obligation:</strong> To comply with the law.</li>
                            </ul>
                        </div>

                        <div ref={sectionRefs.s5} className="relative group pt-4">
                            <h3 className="flex items-center gap-2">5. Data Retention, Transfer, and Disclosure
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard('s5', sectionRefs.s5)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"><CopyIcon className="h-4 w-4 text-gray-500" /></button>
                                    {copiedTooltip === 's5' && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                                </div>
                            </h3>
                            <p><strong>Retention:</strong> We retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. Usage Data is generally retained for a shorter period, except when used for security or to improve functionality.</p>
                            <p><strong>Transfer:</strong> Your information may be transferred to — and maintained on — computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.</p>
                            <p><strong>Disclosure for Law Enforcement:</strong> Under certain circumstances, the Company may be required to disclose your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).</p>
                        </div>

                        <div ref={sectionRefs.s6} className="relative group pt-4">
                            <h3 className="flex items-center gap-2">6. Your Data Protection Rights
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard('s6', sectionRefs.s6)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"><CopyIcon className="h-4 w-4 text-gray-500" /></button>
                                    {copiedTooltip === 's6' && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                                </div>
                            </h3>
                            <p>You have certain data protection rights. We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data. If you have an account, you can update your information directly within your account settings section. If you wish to be informed about what Personal Data we hold about you and if you want it to be removed from our systems, please contact us.</p>
                        </div>
                        
                        <div ref={sectionRefs.s7} className="relative group pt-4">
                            <h3 className="flex items-center gap-2">7. Security of Your Data
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard('s7', sectionRefs.s7)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"><CopyIcon className="h-4 w-4 text-gray-500" /></button>
                                    {copiedTooltip === 's7' && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                                </div>
                            </h3>
                            <p>The security of your data is critical to us. We use commercially acceptable means to protect your Personal Data, including encryption, access controls, and regular security audits. However, remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use the best means to protect your Personal Data, we cannot guarantee its absolute security.</p>
                        </div>
                        
                        <div ref={sectionRefs.s8} className="relative group pt-4">
                            <h3 className="flex items-center gap-2">8. Children's Privacy
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard('s8', sectionRefs.s8)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"><CopyIcon className="h-4 w-4 text-gray-500" /></button>
                                    {copiedTooltip === 's8' && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                                </div>
                            </h3>
                            <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.</p>
                        </div>
                        
                        <div ref={sectionRefs.s9} className="relative group pt-4">
                            <h3 className="flex items-center gap-2">9. Contact Us
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard('s9', sectionRefs.s9)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"><CopyIcon className="h-4 w-4 text-gray-500" /></button>
                                    {copiedTooltip === 's9' && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                                </div>
                            </h3>
                            <p>If you have any questions about this Privacy Policy, you can contact us via email: <a href="mailto:Support@ilovepdfly.com" className="text-brand-red hover:underline">Support@ilovepdfly.com</a>.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;