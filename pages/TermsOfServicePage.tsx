import React, { useRef, useState } from 'react';
import { CopyIcon } from '../components/icons.tsx';

const TermsOfServicePage: React.FC = () => {
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
        s10: useRef<HTMLDivElement>(null),
    };

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
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto bg-white dark:bg-black p-8 md:p-12 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-8">Terms of Service</h1>
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                        <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
                        <p>Welcome to I Love PDFLY. These Terms of Service ("Terms") constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and I Love PDFLY ("Company", "we", "us", or "our"), concerning your access to and use of the https://ilovepdfly.com website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Service”).</p>
                        <p>By using the Service, you agree that you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these terms, then you are expressly prohibited from using the Service and you must discontinue use immediately.</p>
                        
                        <div ref={sectionRefs.s1} className="relative group pt-4">
                            <h3 className="flex items-center gap-2">1. Intellectual Property Rights
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard('s1', sectionRefs.s1)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"><CopyIcon className="h-4 w-4 text-gray-500" /></button>
                                    {copiedTooltip === 's1' && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                                </div>
                            </h3>
                            <p>Unless otherwise indicated, the Service is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Service (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws. The Content and the Marks are provided on the Service “AS IS” for your information and personal use only. Except as expressly provided in these Terms, no part of the Service and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.</p>
                        </div>

                        <div ref={sectionRefs.s2} className="relative group pt-4">
                            <h3 className="flex items-center gap-2">2. User Representations
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard('s2', sectionRefs.s2)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"><CopyIcon className="h-4 w-4 text-gray-500" /></button>
                                    {copiedTooltip === 's2' && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                                </div>
                            </h3>
                            <p>By using the Service, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms; (4) you will not access the Service through automated or non-human means, whether through a bot, script or otherwise; (5) you will not use the Service for any illegal or unauthorized purpose; and (6) your use of the Service will not violate any applicable law or regulation.</p>
                        </div>
                        
                        <div ref={sectionRefs.s3} className="relative group pt-4">
                            <h3 className="flex items-center gap-2">3. User Registration and Accounts
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard('s3', sectionRefs.s3)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"><CopyIcon className="h-4 w-4 text-gray-500" /></button>
                                    {copiedTooltip === 's3' && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                                </div>
                            </h3>
                            <p>You may be required to register with the Service. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.</p>
                        </div>

                        <div ref={sectionRefs.s4} className="relative group pt-4">
                            <h3 className="flex items-center gap-2">4. Prohibited Activities
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard('s4', sectionRefs.s4)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"><CopyIcon className="h-4 w-4 text-gray-500" /></button>
                                    {copiedTooltip === 's4' && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                                </div>
                            </h3>
                            <p>You may not access or use the Service for any purpose other than that for which we make the Service available. As a user of the Service, you agree not to:</p>
                            <ul>
                              <li>Systematically retrieve data or other content from the Service to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
                              <li>Make any unauthorized use of the Service, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false pretenses.</li>
                              <li>Circumvent, disable, or otherwise interfere with security-related features of the Service, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Service.</li>
                              <li>Engage in unauthorized framing of or linking to the Service.</li>
                              <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
                              <li>Interfere with, disrupt, or create an undue burden on the Service or the networks or services connected to the Service.</li>
                              <li>Use any information obtained from the Service in order to harass, abuse, or harm another person.</li>
                              <li>Use the Service as part of any effort to compete with us or otherwise use the Service and/or the Content for any revenue-generating endeavor or commercial enterprise.</li>
                              <li>Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material, including excessive use of capital letters and spamming (continuous posting of repetitive text), that interferes with any party’s uninterrupted use and enjoyment of the Service.</li>
                            </ul>
                        </div>
                        
                        <div ref={sectionRefs.s5} className="relative group pt-4">
                            <h3 className="flex items-center gap-2">5. Premium Services and Payments
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard('s5', sectionRefs.s5)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"><CopyIcon className="h-4 w-4 text-gray-500" /></button>
                                    {copiedTooltip === 's5' && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                                </div>
                            </h3>
                            <p>We offer enhanced features through paid plans ("Premium Services"). All payments are processed through secure third-party payment gateways. All purchases are non-refundable. Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.</p>
                        </div>

                        <div ref={sectionRefs.s6} className="relative group pt-4">
                            <h3 className="flex items-center gap-2">6. Term and Termination
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard('s6', sectionRefs.s6)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"><CopyIcon className="h-4 w-4 text-gray-500" /></button>
                                    {copiedTooltip === 's6' && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                                </div>
                            </h3>
                            <p>These Terms of Service shall remain in full force and effect while you use the Service. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICE (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE TERMS OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE SERVICE OR DELETE YOUR ACCOUNT WITHOUT WARNING, IN OUR SOLE DISCRETION.</p>
                        </div>

                        <div ref={sectionRefs.s7} className="relative group pt-4">
                            <h3 className="flex items-center gap-2">7. Modifications and Interruptions
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard('s7', sectionRefs.s7)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"><CopyIcon className="h-4 w-4 text-gray-500" /></button>
                                    {copiedTooltip === 's7' && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                                </div>
                            </h3>
                            <p>We reserve the right to change, modify, or remove the contents of the Service at any time or for any reason at our sole discretion without notice. We also reserve the right to modify or discontinue all or part of the Service without notice at any time. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Service.</p>
                        </div>
                        
                        <div ref={sectionRefs.s8} className="relative group pt-4">
                            <h3 className="flex items-center gap-2">8. Governing Law and Dispute Resolution
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard('s8', sectionRefs.s8)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"><CopyIcon className="h-4 w-4 text-gray-500" /></button>
                                    {copiedTooltip === 's8' && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                                </div>
                            </h3>
                            <p>These Terms shall be governed by and defined following the laws of Nepal. I Love PDFLY and yourself irrevocably consent that the courts of Nepal shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.</p>
                        </div>

                        <div ref={sectionRefs.s9} className="relative group pt-4">
                            <h3 className="flex items-center gap-2">9. Disclaimer
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard('s9', sectionRefs.s9)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"><CopyIcon className="h-4 w-4 text-gray-500" /></button>
                                    {copiedTooltip === 's9' && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                                </div>
                            </h3>
                            <p>THE SERVICE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICE AND OUR SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICE AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SERVICE’S CONTENT OR THE CONTENT OF ANY WEBSITES LINKED TO THE SERVICE AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SERVICE, (3) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN.</p>
                        </div>
                        
                        <div ref={sectionRefs.s10} className="relative group pt-4">
                            <h3 className="flex items-center gap-2">10. Contact Us
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard('s10', sectionRefs.s10)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"><CopyIcon className="h-4 w-4 text-gray-500" /></button>
                                    {copiedTooltip === 's10' && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                                </div>
                            </h3>
                            <p>In order to resolve a complaint regarding the Service or to receive further information regarding use of the Service, please contact us at: <a href="mailto:Support@ilovepdfly.com" className="text-brand-red hover:underline">Support@ilovepdfly.com</a>.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfServicePage;