import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrainIcon, GlobeIcon, RefreshIcon, StarIcon, UserIcon, LockIcon } from '../components/icons.tsx';

const AboutPage: React.FC = () => {
    useEffect(() => {
        document.title = "About I Love PDFLY | Our Mission and Story";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "Learn about the mission and story behind I Love PDFLY. Discover our commitment to providing simple, powerful, and secure PDF tools for everyone.");
        }
    }, []);

  return (
    <div className="py-16 md:py-24 overflow-x-hidden bg-gray-50 dark:bg-black">
      <div className="px-6">
        <section className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">Our Mission: To Make Document Management Simple, Secure, and Accessible for Everyone</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            At I Love PDFLY, we are building a world where document management is no longer a barrier to productivity. We provide a powerful, intuitive, and secure suite of tools designed to streamline workflows for individuals, professionals, and businesses of all sizes.
          </p>
        </section>

        <div className="max-w-5xl mx-auto mt-16 text-left space-y-16">
          <section>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Our Story</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed bg-white dark:bg-black p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
              <p>
                I Love PDFLY was founded in 2025 with a clear objective: to solve the everyday frustrations of dealing with PDF files. We saw a need for a reliable, accessible, and high-performance online platform that didn’t compromise on user privacy or experience. Traditional PDF software was often clunky, expensive, and required installation, creating unnecessary friction for simple tasks.
              </p>
              <p>
                We started with a handful of core tools—Merge, Split, and Compress—built on the principle of client-side processing to guarantee user privacy. The response was overwhelmingly positive. This initial success fueled our ambition to create a truly all-in-one solution.
              </p>
              <p>
                Today, I Love PDFLY has grown into a comprehensive toolkit trusted by thousands of users daily, driven by continuous innovation and a commitment to our community. We believe that powerful technology should be available to everyone, and we work tirelessly to ensure our tools are both advanced and easy to use.
              </p>
            </div>
          </section>
          
          <section>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Our Technology</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed bg-white dark:bg-black p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
              <p>
                What truly sets I Love PDFLY apart is our foundational commitment to a browser-first, privacy-centric architecture. Unlike many other online services, the vast majority of our tools process your files directly on your own device.
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
                    I Love PDFLY is more than just a set of tools; it's a commitment to better productivity for everyone. We are constantly innovating and improving. If you are passionate about building the future of document management and want to make a global impact, we invite you to explore our API.
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