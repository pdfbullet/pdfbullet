
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrainIcon, GlobeIcon, RefreshIcon, StarIcon, UserIcon, LockIcon } from '../components/icons.tsx';

// Define new icons locally to avoid touching other files and ensure this page works correctly.
const CloudflareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" color="#F38020">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const FonepayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" aria-label="Fonepay Logo">
    <rect width="128" height="128" rx="20" fill="#6C3E91"/>
    <path fill="#fff" d="M38.8 99.4V68.7H25V60.4h13.8V42.3h7.8v18.1H62v8.3H46.6v30.7zM71.2 83.2c-8.2 0-13.6-5.3-13.6-13.8 0-8.8 5.6-14 14.2-14 3.9 0 6.5.7 8.6 1.9l-2.1 6.8c-1.9-1-3.8-1.6-6.3-1.6-4.5 0-6.9 2.6-6.9 7.2 0 4.7 2.7 7.2 7.2 7.2 2.2 0 4.2-.6 6-1.7l2.2 6.6c-2.7 1.3-5.6 2-9.1 2zM89.7 99.4h-7.7V55.8h7.7zM100.6 99.4h-7.7V55.8h7.7zM104.4 51.1c-2.4 0-3.9-1.6-3.9-3.7s1.6-3.7 3.9-3.7c2.4 0 3.9 1.6 3.9 3.7s-1.5 3.7-3.9 3.7z"/>
  </svg>
);

const KhaltiIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="Khalti Logo">
    <rect width="100" height="100" rx="15" fill="#5D2E8E"/>
    <path d="M50 20v60m0-30l25-25m-25 25l25 25m-25-25H25" stroke="#fff" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


const AboutPage: React.FC = () => {
    useEffect(() => {
        document.title = "About PDFBullet | Our Mission and Story";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "Learn about the mission and story behind PDFBullet. Discover our commitment to providing simple, powerful, and secure PDF tools for everyone.");
        }
    }, []);

  return (
    <div className="py-16 md:py-24 overflow-x-hidden">
      <div className="px-6">
        <section className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">Our Mission: To Make Document Management Simple, Secure, and Accessible for Everyone</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            At PDFBullet, we are building a world where document management is no longer a barrier to productivity. We provide a powerful, intuitive, and secure suite of tools designed to streamline workflows for individuals, professionals, and businesses of all sizes.
          </p>
        </section>

        <div className="max-w-5xl mx-auto mt-16 text-left space-y-16">
          <section>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Our Story</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed bg-white dark:bg-black p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
              <p>
                PDFBullet was founded in 2025 with a clear objective: to solve the everyday frustrations of dealing with PDF files. We saw a need for a reliable, accessible, and high-performance online platform that didn’t compromise on user privacy or experience. Traditional PDF software was often clunky, expensive, and required installation, creating unnecessary friction for simple tasks.
              </p>
              <p>
                We started with a handful of core tools—Merge, Split, and Compress—built on the principle of client-side processing to guarantee user privacy. The response was overwhelmingly positive. This initial success fueled our ambition to create a truly all-in-one solution.
              </p>
              <p>
                Today, PDFBullet has grown into a comprehensive toolkit trusted by thousands of users daily, driven by continuous innovation and a commitment to our community. We believe that powerful technology should be available to everyone, and we work tirelessly to ensure our tools are both advanced and easy to use.
              </p>
            </div>
          </section>
          
          <section>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Our Technology</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed bg-white dark:bg-black p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
              <p>
                What truly sets PDFBullet apart is our foundational commitment to a browser-first, privacy-centric architecture. Unlike many other online services, the vast majority of our tools process your files directly on your own device.
              </p>
              <p>
                <strong>Client-Side Processing:</strong> By harnessing the power of modern web browsers and technologies like WebAssembly, we perform complex operations like merging, compressing, and editing without your files ever leaving your computer. This means no upload time, instant processing, and absolute privacy. Your documents remain yours, from start to finish.
              </p>
               <p>
                <strong>Secure Server-Side Tasks:</strong> For select tools that require intensive computational power beyond the browser's capabilities (like advanced OCR or certain conversions), we utilize a secure, encrypted connection for temporary file handling. Even then, your files are automatically and permanently deleted from our servers within a few hours. We don’t store, we don’t analyze, and we certainly don’t share your data. This hybrid model ensures both maximum performance and uncompromising security.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow-md text-center border-glow-hover">
                <UserIcon className="h-10 w-10 mx-auto mb-3 text-brand-red" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">User-Centric Simplicity</h3>
                <p className="text-gray-600 dark:text-gray-400">Every tool we build is meticulously designed for people. We believe in creating clean, intuitive interfaces that empower users to accomplish complex tasks with minimal effort.</p>
              </div>
              <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow-md text-center border-glow-hover">
                <RefreshIcon className="h-10 w-10 mx-auto mb-3 text-brand-red" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Performance & Speed</h3>
                <p className="text-gray-600 dark:text-gray-400">Time is valuable. By leveraging cutting-edge, browser-based processing, we eliminate upload delays and deliver instant results, making your workflow faster than ever.</p>
              </div>
              <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow-md text-center border-glow-hover">
                <LockIcon className="h-10 w-10 mx-auto mb-3 text-brand-red" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Uncompromising Security</h3>
                <p className="text-gray-600 dark:text-gray-400">Your documents are your own. We are fundamentally committed to your privacy. Our platform is built with a security-first architecture, ensuring your files are processed securely and never stored.</p>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Trust & Security</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow-md text-center border-glow-hover">
                <LockIcon className="h-10 w-10 mx-auto mb-3 text-green-500" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">SSL Encrypted</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">All connections are secured with end-to-end SSL encryption to protect your data.</p>
              </div>
              <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow-md text-center border-glow-hover">
                <CloudflareIcon className="h-10 w-10 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Secured by Cloudflare</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Our infrastructure is protected against DDoS attacks and other threats by Cloudflare.</p>
              </div>
              <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow-md text-center border-glow-hover">
                <TrashIcon className="h-10 w-10 mx-auto mb-3 text-red-500" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Auto File Deletion</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">For your privacy, all processed files are automatically deleted from our servers after 2 hours.</p>
              </div>
              <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow-md text-center border-glow-hover">
                 <div className="flex justify-center items-center gap-4 h-10 mx-auto mb-3">
                    <FonepayIcon className="h-8 w-auto" />
                    <KhaltiIcon className="h-8 w-auto" />
                 </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Secure Payments</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">We use trusted gateways like FonePay & Khalti for secure and reliable transactions.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Our Vision for the Future</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
                 <div className="bg-white dark:bg-black p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                    <BrainIcon className="h-10 w-10 mx-auto mb-3 text-purple-500" />
                    <h3 className="text-xl font-bold">Smarter Document Intelligence</h3>
                    <p className="text-gray-600 dark:text-gray-400">Expanding our AI capabilities to provide deeper insights, automate complex document analysis, and create a truly intelligent assistant for your files.</p>
                </div>
                 <div className="bg-white dark:bg-black p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                    <GlobeIcon className="h-10 w-10 mx-auto mb-3 text-blue-500" />
                    <h3 className="text-xl font-bold">Seamless Collaboration</h3>
                    <p className="text-gray-600 dark:text-gray-400">The future is collaborative. We are developing features for teams to securely edit, share, and manage documents together in real-time, from anywhere in the world.</p>
                </div>
                 <div className="bg-white dark:bg-black p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                    <StarIcon className="h-10 w-10 mx-auto mb-3 text-yellow-500" />
                    <h3 className="text-xl font-bold">Enterprise-Grade Solutions</h3>
                    <p className="text-gray-600 dark:text-gray-400">Delivering powerful, scalable tools that meet the demands of modern businesses, with a focus on robust APIs, enhanced security, and dedicated support.</p>
                </div>
            </div>
          </section>
          
           <section>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Join Us on Our Journey</h2>
             <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 text-center">
                 <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
                    PDFBullet is more than just a set of tools; it's a commitment to better productivity for everyone. We are constantly innovating and improving. If you are passionate about building the future of document management and want to make a global impact, we invite you to explore our API.
                 </p>
                 <Link to="/developer" className="inline-block mt-6 font-semibold text-brand-red hover:underline">
                    Explore our Developer API &rarr;
                 </Link>
             </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default AboutPage;
