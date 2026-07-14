import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, CodeIcon } from '../components/icons.tsx';

const FeatureCard: React.FC<{ title: string; features: string[] }> = ({ title, features }) => (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
        <ul className="space-y-3">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                </li>
            ))}
        </ul>
    </div>
);

const WhyChooseItem: React.FC<{ title: string; text: string }> = ({ title, text }) => (
    <div className="text-center md:text-left">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{text}</p>
    </div>
);


const ApiSignaturePage: React.FC = () => {
    return (
        <div>
            {/* Hero Section */}
             <section 
              className="relative bg-teal-800 text-white py-24 md:py-32" 
            >
              <img 
                src="https://ik.imagekit.io/fonepay/imgi_19_background.png?updatedAt=1754032191458" 
                alt="Abstract signature background"
                className="absolute inset-0 w-full h-full object-cover opacity-30"
                width="1920"
                height="1080"
                loading="lazy"
                decoding="async"
              />
              <div className="relative z-10 container mx-auto px-6 max-w-7xl">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Column: Text Content */}
                    <div className="text-left">
                        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                        A robust and easy to implement e-Signature API
                        </h1>
                        <p className="mt-4 text-lg text-gray-200">
                        Automate the signing process with legally binding e-signatures
                        </p>
                        <div className="mt-8">
                        <Link 
                            to="/api-reference#sign-pdf" 
                            className="inline-block bg-cyan-400 hover:bg-cyan-500 text-teal-900 font-bold py-3 px-8 rounded-md transition-colors text-lg"
                        >
                            View API Documentation
                        </Link>
                        </div>
                    </div>
                    
                    {/* Right Column: Code Snippet */}
                    <div className="hidden md:block bg-black/50 p-6 rounded-lg font-mono text-sm backdrop-blur-sm border border-white/20">
                        <pre><code className="language-php">
                        <span className="text-cyan-300">$signatureElement</span>
                        <span className="text-gray-400">-&gt;</span>
                        <span className="text-yellow-300">setPosition</span>
                        <span className="text-gray-400">(</span>
                        <span className="text-orange-400">20</span>
                        <span className="text-gray-400">, </span>
                        <span className="text-orange-400">-20</span>
                        <span className="text-gray-400">)</span>
                        <br />
                        <span className="text-gray-400">                  -&gt;</span>
                        <span className="text-yellow-300">setPages</span>
                        <span className="text-gray-400">(</span>
                        <span className="text-green-400">"1"</span>
                        <span className="text-gray-400">)</span>
                        <br />
                        <span className="text-gray-400">                  -&gt;</span>
                        <span className="text-yellow-300">setSize</span>
                        <span className="text-gray-400">(</span>
                        <span className="text-orange-400">40</span>
                        <span className="text-gray-400">);</span>
                        <br /><br />
                        <span className="text-gray-500">// Create a signer</span>
                        <br />
                        <span className="text-cyan-300">$signer</span>
                        <span className="text-gray-400"> = </span>
                        <span className="text-purple-400">new</span>
                        <span className="text-white"> Signer</span>
                        <span className="text-gray-400">(</span>
                        <span className="text-green-400">"name"</span>
                        <span className="text-gray-400">, </span>
                        <span className="text-green-400">"signer@email.com"</span>
                        <span className="text-gray-400">);</span>
                        <br /><br />
                        <span className="text-gray-500">// Assign the signer an element to be signed</span>
                        <br />
                        <span className="text-cyan-300">$signer</span>
                        <span className="text-gray-400">-&gt;</span>
                        <span className="text-yellow-300">addElements</span>
                        <span className="text-gray-400">(</span>
                        <span className="text-cyan-300">$file</span>
                        <span className="text-gray-400">, </span>
                        <span className="text-cyan-300">$signatureElement</span>
                        <span className="text-gray-400">);</span>
                        <br /><br />
                        <span className="text-cyan-300">$signTask</span>
                        <span className="text-gray-400">-&gt;</span>
                        <span className="text-yellow-300">addReceiver</span>
                        <span className="text-gray-400">(</span>
                        <span className="text-cyan-300">$signer</span>
                        <span className="text-gray-400">);</span>
                        <br />
                        <span className="text-cyan-300">$signature</span>
                        <span className="text-gray-400"> = </span>
                        <span className="text-cyan-300">$signTask</span>
                        <span className="text-gray-400">-&gt;</span>
                        <span className="text-yellow-300">execute</span>
                        <span className="text-gray-400">()-&gt;</span>
                        <span className="text-cyan-300">result</span>
                        <span className="text-gray-400">;</span>
                        </code></pre>
                    </div>
                </div>
              </div>
            </section>

            {/* Feature Cards Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-6 max-w-6xl">
                     <div className="text-center max-w-4xl mx-auto mb-12">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">
                            Everything you need for integrating secure eSignature workflows
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        <FeatureCard title="Core features" features={['Audit trail', 'Branding', 'Signer fields', 'Signature Types', 'SMS Authentication']} />
                        <FeatureCard title="Document archiving" features={['PDF/A', 'Tamper-proof documents']} />
                        <FeatureCard title="Development" features={['SDK for popular languages', 'Technical support', 'API documentation', 'API Dashboard', 'Webhooks']} />
                        <FeatureCard title="Certifications" features={['Advanced EIDAS Signatures', 'ISO27001', 'GDPR']} />
                    </div>
                </div>
            </section>
            
            {/* Why Choose Us Section */}
            <section className="bg-white dark:bg-gray-900 py-16 md:py-24">
                 <div className="container mx-auto px-6 max-w-6xl">
                    <h2 className="text-3xl font-extrabold text-center mb-12">Why choose the I Love PDFLY API?</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        <WhyChooseItem title="Powerful and Secure" text="All documents are stored in european servers and encrypted at rest using AES 256-bit encryption." />
                        <WhyChooseItem title="Built for scalability" text="I Love PDFLY has 10+ years of experience in document management services, being a reliable software provider trusted by millions." />
                        <WhyChooseItem title="Easy to integrate" text="We provide extensive and detailed documentation that will make your integration quick and hassle-free." />
                    </div>
                </div>
            </section>
            
            {/* Pricing Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-extrabold">Pricing</h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">I Love PDFLY offers prepaid packages at a competitive price. Create a pack that suits your needs and pay as you go with no commitment.</p>
                            <Link to="/api-pricing" className="mt-6 inline-block bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-8 rounded-lg transition-colors">View Pricing</Link>
                        </div>
                        <div className="flex justify-center">
                            <img src="https://www.iloveapi.com/img/signature/pricing/looking-tablet.png" alt="Man working on a tablet" className="max-w-sm w-full" width="384" height="384" loading="lazy" decoding="async"/>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Security Section */}
            <section className="bg-blue-50 dark:bg-blue-900/20 py-16 md:py-24">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <h2 className="text-3xl font-extrabold">The security of your data is our #1 priority</h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">All files uploaded to I Love PDFLY are encrypted using Hypertext Transfer Protocol Secure (HTTPS). I Love PDFLY does not access, use, analyze or store any processed data. If you want to know more about I Love PDFLY's data collection, read our Privacy Policy.</p>
                    <div className="mt-8 flex justify-center items-center gap-8 opacity-60">
                         <span>PDF association</span>
                         <span>ISO certified</span>
                         <span>SSL Encrypted</span>
                         <span>eIDAS compliant</span>
                    </div>
                </div>
            </section>
            
            {/* Final CTA Section */}
            <section className="bg-teal-600 text-white py-16 md:py-24">
                 <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-center md:text-left">
                             <h2 className="text-4xl font-extrabold">Learn how to easily implement Digital Signatures in your project</h2>
                             <Link to="/api-reference#sign-pdf" className="mt-6 inline-block bg-white text-teal-600 font-bold py-3 px-8 rounded-md transition-colors hover:bg-gray-100">View API Documentation</Link>
                        </div>
                        <div className="flex justify-center">
                            <img src="https://www.iloveapi.com/img/signature/learn/macbook.png" alt="Laptop showing an API dashboard" className="max-w-lg w-full" width="512" height="320" loading="lazy" decoding="async"/>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ApiSignaturePage;