import React, { useState, useEffect, useRef } from 'react';

const TermsOfServicePage: React.FC = () => {
    const [activeSection, setActiveSection] = useState('use-of-service');
    const mainContentRef = useRef<HTMLDivElement>(null);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        document.title = "Terms and Conditions | PDFBullet";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "Read the Terms and Conditions for using PDFBullet. Learn about your rights and responsibilities when using our free online PDF tools.");
        }

        const handleIntersect = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
                    setActiveSection(entry.target.id);
                }
            });
        };
        
        // Disconnect previous observer if it exists
        if (observer.current) {
            observer.current.disconnect();
        }

        observer.current = new IntersectionObserver(handleIntersect, {
            root: null, 
            rootMargin: '0px 0px -50% 0px', // Trigger when section is in the top half of the viewport
            threshold: 0.1,
        });

        const sections = document.querySelectorAll('section[id]');
        sections.forEach(section => observer.current?.observe(section));

        return () => {
            sections.forEach(section => observer.current?.unobserve(section));
        };
    }, []);

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        e.preventDefault();
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    };
    
     const sections = [
        { id: 'use-of-service', title: 'Use of Service', subsections: ['General', 'Service Rules', 'Cookies'] },
        { id: 'accounts', title: 'Accounts', subsections: ['General'] },
        { id: 'user-content', title: 'User Content', subsections: ['General', 'File Storage Policy'] },
        { id: 'signature', title: 'Signature', subsections: ['How it works', 'Legal Guarantees', 'Pricing', 'Collected Information'] },
        { id: 'paid-services', title: 'Paid Services', subsections: ['Billing Policies', 'Refunds', 'Payment information, taxes', 'Free Trial'] },
        { id: 'no-warranty', title: 'No warranty', subsections: ['General'] },
        { id: 'liability-limitation', title: 'Limitation of liability', subsections: ['General'] },
        { id: 'ip-rights', title: 'Intellectual and industrial property rights', subsections: ['General'] },
        { id: 'termination', title: 'Termination', subsections: ['General'] },
        { id: 'claims', title: 'Claims', subsections: [] },
        { id: 'miscellaneous', title: 'Miscellaneous', subsections: [] },
        { id: 'applicable-legislation', title: 'Applicable legislation and jurisdiction', subsections: [] },
    ];
    
    const toolDeletionTimes = [
        { name: "Merge PDF", time: "2 hours" }, { name: "PDF to Word", time: "2 hours" },
        { name: "Split PDF", time: "2 hours" }, { name: "PDF to Excel", time: "2 hours" },
        { name: "Remove Pages", time: "2 hours" }, { name: "PDF to PowerPoint", time: "2 hours" },
        { name: "Extract Pages", time: "2 hours" }, { name: "PowerPoint to PDF", time: "2 hours" },
        { name: "Organize PDF", time: "2 hours" }, { name: "JPG to PDF", time: "2 hours" },
        { name: "Compress PDF", time: "2 hours" }, { name: "HTML to PDF", time: "2 hours" },
        { name: "Repair PDF", time: "2 hours" }, { name: "PDF to JPG", time: "2 hours" },
        { name: "Word to PDF", time: "2 hours" }, { name: "PDF to PDF/A", time: "2 hours" },
        { name: "Excel to PDF", time: "2 hours" }, { name: "Rotate PDF", time: "2 hours" },
        { name: "Page Numbers", time: "2 hours" }, { name: "Watermark", time: "2 hours" },
        { name: "Unlock PDF", time: "2 hours" }, { name: "Protect PDF", time: "2 hours" },
        { name: "Sign PDF", time: "As required by law" }
    ];

    const getIsSectionActive = (id: string) => {
        const parts = activeSection.split('-');
        if (parts.length > 2) {
            return id === `${parts[0]}-${parts[1]}`;
        }
        return id === parts[0];
    };

    return (
        <div className="py-16 md:py-20 bg-white dark:bg-black">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar */}
                    <aside className="w-full lg:w-1/4 lg:sticky top-24 self-start">
                         <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Terms and Conditions</h2>
                         <nav>
                            <ul className="space-y-1">
                                {sections.map(section => (
                                    <li key={section.id}>
                                        <a href={`#${section.id}`} 
                                           onClick={(e) => handleLinkClick(e, section.id)}
                                           className={`block text-lg font-semibold py-1 transition-colors relative pl-4 ${getIsSectionActive(section.id) ? 'text-brand-red' : 'text-gray-600 dark:text-gray-400 hover:text-brand-red'}`}>
                                            {getIsSectionActive(section.id) && <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand-red rounded-r-full"></span>}
                                            {section.title}
                                        </a>
                                        {section.subsections.length > 0 && (
                                            <ul className="pl-6 mt-1 space-y-1">
                                                {section.subsections.map(sub => {
                                                    const subId = `${section.id}-${sub.toLowerCase().replace(/ /g, '-')}`;
                                                    return (
                                                        <li key={subId}>
                                                            <a href={`#${subId}`} 
                                                               onClick={(e) => handleLinkClick(e, subId)}
                                                               className={`text-sm transition-colors ${activeSection === subId ? 'text-brand-red font-semibold' : 'text-gray-500 hover:text-brand-red'}`}>
                                                                {sub}
                                                            </a>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                         </nav>
                    </aside>
                    
                    {/* Main Content */}
                    <main ref={mainContentRef} className="w-full lg:w-3/4">
                         <div className="prose dark:prose-invert max-w-none">
                            <p className="text-brand-red font-semibold mb-2">Legal & Privacy</p>
                            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">Terms and Conditions</h1>
                            <p className="lead">Welcome to pdfbullet.com (from this point onwards "the Service"). The Service offers its users solely a web and mobile application which allows users to manipulate documents and/or images through online software.</p>
                            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm mb-8 not-prose">
                                <p>The text in the summary boxes aims to give a plain summary of our Terms and Conditions. Please make sure to read our Terms and Conditions carefully, because the summary doesn't cover all the important details.</p>
                            </div>
                            
                            <section id="use-of-service" className="scroll-mt-24">
                                <h2>1. Use of Our Service</h2>
                                <h3 id="use-of-service-general">1.1 General</h3>
                                <p>This page explains the terms by which you may use our online and/or mobile services, website, and software provided on or in connection with the service (collectively, "the Service"). By accessing or using pdfbullet.com, you agree to be conformant to this Terms and Conditions agreement ("Agreement") whether or not you are registered on our services. In the case of disagreement with all or part of these Terms and Conditions, you should abstain from using the Service.</p>
                                <p>By means of acceptance of the current Terms and Conditions, the User agrees to comply with the following service rules:</p>
                                <ul>
                                    <li>To have read and understood what is explained here.</li>
                                    <li>To have assumed all of the obligations that are stated here.</li>
                                    <li>To use the Service solely for purposes permitted by law and which do not violate the rights of a third-party.</li>
                                    <li>To not use this website for any unlawful activity. You are prohibited to break any term and condition to not generate content dedicated to creating SPAM or which could provide instructions about how to engage in illegal activities.</li>
                                    <li>To not gather, handle, or store personal information about other Users or third-parties without complying with the current legislation regarding the protection of information.</li>
                                </ul>
                                <p>If the regulations in the Terms and Conditions are in contradiction with the privacy policy, Terms and Conditions will prevail. Failure to comply with these obligations may result in the cancellation of the Contract, as is established in Clause 9.</p>
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm my-4 not-prose">Please be nice. Don't try to hack our servers, send spam or break any other rules, regulations, or laws. We love working with you, but please don't use our Brand to do anything malicious. These are the things you just can't do.</div>
                                
                                 <h3 id="use-of-service-service-rules">1.2 Service Rules</h3>
                                 <p>Your use of the Service and PDFBullet Desktop is subject to this Reasonable Use Policy, which has been created to ensure that our service is fair for both users and developers. The following is not permitted in connection with PDFBullet Services and Desktop App:</p>
                                  <ul>
                                    <li>Using any automated or non-automated scraping process (including bots, scrapers, and spiders) in conjunction with PDFBullet.</li>
                                    <li>Converting or otherwise editing documents with PDFBullet Desktop at a rate that exceeds what a human can reasonably do by using manual means and a conventional device.</li>
                                    <li>Providing your password to any other person or using any other person's username and password to access PDFBullet Desktop.</li>
                                    <li>Abusing PDFBullet Desktop in excess of what is reasonably needed for legitimate business or personal purposes. PDFBullet may investigate any account that registers over 1000 tasks in a month to determine compliance with this requirement.</li>
                                 </ul>
                                 <p>If PDFBullet determines that you are in breach of this policy, we may temporarily or permanently suspend or terminate your account or your subscription to the Service.</p>
                                 
                                 <h3 id="use-of-service-cookies">1.3 Cookies</h3>
                                 <p>PDFBullet websites are a Software as a Service (SaaS), and use cookies, which are essential for the operations of the service and for its correct functionality. A minimal number of other non-essential cookies will be placed under your consent. In case you do not accept, manage or reject the use of cookies, consent will be granted by using our software; yet you can give or withdraw consent to these from our <a href="/#/cookies-policy">Cookie Policy</a> page anytime.</p>
                            </section>
                            
                            <section id="accounts" className="scroll-mt-24">
                                 <h2>2. Accounts</h2>
                                <h3 id="accounts-general">2.1 General</h3>
                                <p>PDFBullet gives the user access to the services and functionality that we may establish and maintain from time to time and in our sole discretion. We may maintain different types of accounts for different types of Users. The different account types allow the user to work within different file size and file number limitations. Our Service users' types are as follows:</p>
                                <ul>
                                    <li>Not registered</li>
                                    <li>Registered</li>
                                    <li>Premium</li>
                                </ul>
                                <p>User is solely responsible for the activity that occurs on his account and must keep his account password secure. PDFBullet owns the right to totally or partially stop providing any of its Services whenever it considers it appropriate and would only give prior notification to Premium Users. In the previous operations, the corresponding taxes will be applied to the Users, assuming payment whomsoever, in conformity with the current regulation, is considered a passive subject of these operations.</p>
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm my-4 not-prose">You are responsible for whatever is done on your Account, so make sure you have a strong password and don't let anyone else use it.</div>
                            </section>

                            <section id="user-content" className="scroll-mt-24">
                                <h2>3. User Content</h2>
                                <h3 id="user-content-general">3.1 General</h3>
                                <p>PDFBullet does not analyse the content of files whilst processing them and only Users will have access to the edited files once PDFBullet has processed them. If chosen by the user, this link can be shared with someone else. PDFBullet will automatically delete processed files from their servers after a defined period of time depending on the tool used:</p>
                                
                                <h3 id="user-content-file-storage-policy">3.2 File Storage Policy</h3>
                                <div className="overflow-x-auto my-4 not-prose">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-4 py-2 font-semibold">Tool</th><th className="px-4 py-2 font-semibold text-right">Deletion Time</th>
                                                <th className="px-4 py-2 font-semibold">Tool</th><th className="px-4 py-2 font-semibold text-right">Deletion Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {Array.from({ length: Math.ceil(toolDeletionTimes.length / 2) }).map((_, i) => (
                                                <tr key={i}>
                                                    <td className="px-4 py-2">{toolDeletionTimes[i*2].name}</td>
                                                    <td className="px-4 py-2 text-right">{toolDeletionTimes[i*2].time}</td>
                                                    {toolDeletionTimes[i*2+1] ? <>
                                                        <td className="px-4 py-2">{toolDeletionTimes[i*2+1].name}</td>
                                                        <td className="px-4 py-2 text-right">{toolDeletionTimes[i*2+1].time}</td>
                                                    </> : <><td className="px-4 py-2"></td><td className="px-4 py-2"></td></>}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-xs">* Certified signatures and signature requests will be saved for as long as required by law, whilst simple signatures will be deleted automatically after 2 hours.</p>
                                <p>Users bear the sole responsibility for the usage of their own files. PDFBullet is limited to offer users access to their own processed files. These files will only remain stored on our servers during the time that the download link is available.</p>
                            </section>
                            
                            <section id="signature" className="scroll-mt-24">
                                <h2>4. Signature</h2>
                                <h3 id="signature-how-it-works">4.1 How it works</h3>
                                <p>PDFBullet Signature permits documents to be signed electronically by signatory's self or one can request for signatures from other signatories by means of email delivery. Signatory has two electronic signature options:</p>
                                <ul>
                                    <li>Simple electronic signature</li>
                                    <li>Advanced electronic signature</li>
                                </ul>
                                <h3 id="signature-legal-guarantees">4.2 Legal Guarantees</h3>
                                <p>The electronic signature services provided by PDFBullet are regulated by Spanish and European Laws, particularly, by EU Regulation 910/2014 ("eIDAS Regulation"), directly applicable in all member countries of the European Union, and Spanish Law 6/2020 (trusted electronic services) where PDFBullet is located. Services could also comply with the requirements of the U.S. Electronic Signature in Global and National Commerce Act of 2000 (ESIGN), and the Uniform Electronic Transactions Act (UETA) or other Laws in many jurisdictions.</p>
                                <h3 id="signature-pricing">4.3 Pricing</h3>
                                <p>PDFBullet offers two different kinds of signatures: simple electronic signatures and advanced electronic signatures. Simple electronic signatures are free of use. Signatures may be subject to size or quantity limitations of processing (see pricing for more information). We offer a certain number of advanced electronic signatures at no extra cost for our Premium users each month. We also provide prepaid packs of advanced electronic signatures which can be purchased.</p>
                                <h3 id="signature-collected-information">4.4 Collected Information</h3>
                                <p>For the sake of full transparency throughout the signature process, PDFBullet may collect the following information for the processing of the signature and audit trail, and will be visible by all parties involved: Name of requester, signer, validator, and witness, Email of requester, signer, validator, and witness, Phone number of signer which needs SMS code validation, Name of file(s) being signed, IP of requester, signer, validator, and witness and Biometric data of requester, signer, validator, and witness.</p>
                            </section>

                            <section id="paid-services" className="scroll-mt-24">
                                <h2>5. Paid Services</h2>
                                <h3 id="paid-services-billing-policies">5.1 Billing Policies</h3>
                                <p>Becoming Premium is only possible by paid subscription. Subscriptions start when first payment is made. These are recurring billing transactions. Unless otherwise stated, your subscription and the relevant billing authorization will continue indefinitely until canceled by you. By paid subscription, you authorize us to bill you for the service purchased at the acquisition Price. The billing rate is subject to change during the subscription period. However, existent Premium users would pay the same amount that the billing rate subscribed.</p>
                                <h3 id="paid-services-refunds">5.2 Refunds</h3>
                                <p>You may cancel your Premium account at any time; however, there are no refunds for cancellation. In the event that PDFBullet suspends or terminates your account or this Agreement, you understand and agree that you shall receive no refund or exchange for any credits, any unused time on a subscription and any license or subscription fees for any portion of the Service.</p>
                                <h3 id="paid-services-payment-information-taxes">5.3 Payment information, taxes</h3>
                                <p>All information provided by the User in connection with a purchase or transaction with the Service must be accurate, complete, and current. You agree to pay all charges incurred by users of your payment method used in connection with a purchase or with the Service. You will pay applicable taxes, if any, relating to your purchases.</p>
                                <h3 id="paid-services-free-trial">5.4 Free Trial</h3>
                                <p>This offer (the "Offer"), which is made to you by PDFBullet (as defined in the PDFBullet Terms and Conditions of Use), entitles you access to the PDFBullet Premium Service (as defined in the PDFBullet Terms and Conditions of Use) for a period of seven (7) days from the moment that you activate such trial period by submitting your payment details (the "Free Trial Period"). By submitting your payment details, (i) you accept the Offer, (ii) consent to us using your payment details in accordance with our Privacy Policy, (iii) acknowledge and agree to PDFBullet Terms and Conditions of Use and these Offer Terms and Conditions.</p>
                            </section>

                            <section id="no-warranty" className="scroll-mt-24">
                                <h2>6. No warranty</h2>
                                <h3 id="no-warranty-general">6.1 General</h3>
                                <p>Use of the service is at your own risk. To the maximum extent permitted by applicable law, the service is provided without warranties of any kind. PDFBullet does not warrant that the service will meet your requirements; that the service will be available at any particular time or location, uninterrupted or secure; that any defects or errors will be corrected; or that the service is free of viruses or other harmful components.</p>
                            </section>

                            <section id="liability-limitation" className="scroll-mt-24">
                                <h2>7. Limitation of liability</h2>
                                <h3 id="liability-limitation-general">7.1 General</h3>
                                <p>To the maximum extent permitted by applicable law, in no event shall PDFBullet or its employees be liable for any direct, indirect, punitive, incidental, special, consequential or exemplary damages, including without limitation damages for use, data or other intangible losses, arising from or relating to any breach of this agreement. Under no circumstances will PDFBullet be responsible for any damage, loss or injury resulting from hacking, tampering or other unauthorized access or use of the service or your account or the information contained therein.</p>
                            </section>

                            <section id="ip-rights" className="scroll-mt-24">
                                <h2>8. Intellectual and industrial property rights</h2>
                                <h3 id="ip-rights-general">8.1 General</h3>
                                <p>The contents of this site, including the contents, brands, logos, drawings, texts, images, databases, codes, and any other material belong to PDFBullet or to third-parties who have authorized their use. In a general manner, their utilization with commercial ends, their public communication or distribution, or any other form of exploitation by any process, such as transformation or alteration, all remains prohibited. We expressly disclaim liability for consequential damages resulting from using or misusing our services.</p>
                            </section>

                            <section id="termination" className="scroll-mt-24">
                                <h2>9. Termination</h2>
                                <h3 id="termination-general">9.1 General</h3>
                                <p>PDFBullet will be capable of unilaterally and, at any point, resolving the current Contract in the following cases. a) In the event that the User breaches any of the obligations and guarantees established in this Agreement. b) If intellectual property rights or any other third-party rights are infringed upon. c) If User fails to make the timely payment of fees for the Software or the Services. d) If we are required to do so by law (for example, if providing software to a specific region becomes unlawful) e) If we choose to discontinue the Services or Software, in whole or in part, (such as if it becomes impractical for us to provide Service or our website becomes censored in a region).</p>
                            </section>
                            
                            <section id="claims" className="scroll-mt-24">
                                <h2>10. Claims</h2>
                                <p>In case of claims and complaints stemming from the current Contract, or to request information about the Service, the User will be able to contact PDFBullet through the online form.</p>
                            </section>

                            <section id="miscellaneous" className="scroll-mt-24">
                                <h2>11. Miscellaneous</h2>
                                <p>The User will not be able to cede, subrogate, or transmit the rights contained in the current Contract to third parties without the previous written consent of PDFBullet. Same as the previous point. We are a registered trademark, you can't copy our brand identity. The offense or delay in the exercise of any right or in the demand for the completion of any of the obligations arising from this Contract will not constitute a renunciation of that right or demand for the completion of the obligations. This Contract, including the Privacy Policy which will be incorporated for reference into the current Contract, constitutes the final, complete, and exclusive agreement between the parties in relation to the object of the Contract, and substitutes any of the previous agreements or negotiations between said parties.</p>
                            </section>
                            
                            <section id="applicable-legislation" className="scroll-mt-24">
                                <h2>12. Applicable legislation and jurisdiction</h2>
                                <p>The current Contract has a commercial character and should be interpreted and complied with according to its terms, and, in case of the unexpected, will be regulated by Spanish law. In the steps permitted by governing laws, for the resolution of any controversies deriving from the validity, interpretation, completion, or execution of this Contract, the parties, with express resignation to any other jurisdiction to which they may correspond, expressly subject themselves to the jurisdiction and power of the judges and courts of the city of Barcelona.</p>
                                <p>Last revision: {new Date().toLocaleDateString()}</p>
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default TermsOfServicePage;