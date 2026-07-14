import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GlobeIcon, RefreshIcon, LockIcon } from '../components/icons.tsx';

const CeoPage: React.FC = () => {
    useEffect(() => {
        document.title = "A Message From Our CEO | PDFBullet";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "Read a message from the CEO of PDFBullet. Learn about our vision, our commitment to innovation, and the future of document management.");
        }

        // Add Person JSON-LD schema for SEO
        const scriptId = 'ceo-schema-page';
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;
        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Bishal Mishra",
            "jobTitle": "Founder & CEO",
            "image": "https://i.ibb.co/RpStGhqm/IMG-5251-Original.jpg",
            "worksFor": {
                "@type": "Organization",
                "name": "PDFBullet",
                "url": "https://pdfbullet.com/"
            },
            "url": "https://pdfbullet.com/ceo"
        });

        return () => {
            const scriptToRemove = document.getElementById(scriptId);
            if (scriptToRemove) {
                scriptToRemove.remove();
            }
        };

    }, []);

    return (
        <div className="py-16 md:py-24 overflow-x-hidden">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto">
                    <section className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-16">
                        <div className="flex-shrink-0">
                            <img 
                                src="https://i.ibb.co/RpStGhqm/IMG-5251-Original.jpg" 
                                alt="Bishal Mishra, CEO of PDFBullet"
                                className="h-40 w-40 md:h-56 md:w-56 rounded-full object-cover shadow-2xl border-4 border-brand-red/50"
                                width="224"
                                height="224"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">
                                A Message from Our CEO
                            </h1>
                            <p className="mt-2 text-xl font-semibold text-gray-700 dark:text-gray-200">Bishal Mishra</p>
                            <p className="text-md text-gray-500 dark:text-gray-400">Founder & Chief Executive Officer</p>
                        </div>
                    </section>

                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        <p className="text-2xl font-semibold italic text-gray-800 dark:text-gray-100">
                            "We didn't just build a set of tools; we built a new way to work. Our goal is to remove every barrier between you and your documents, making your workflow seamless, secure, and incredibly fast."
                        </p>
                        
                        <p>
                            Welcome to PDFBullet.
                        </p>
                        <p>
                            When we started this journey in 2025, our goal was simple yet ambitious: to solve the universal frustrations people face with document management every single day. We envisioned a world where you didn't need expensive, complicated software to perform essential tasks like merging a report, compressing a file for an email, or signing a critical contract.
                        </p>
                        <p>
                            What we've built is a testament to that vision. PDFBullet is more than just a utility; it's a powerful, secure, and intuitive platform designed to give you back your most valuable asset: your time. Our core philosophy is built on three pillars that guide every decision we make:
                        </p>

                        <div className="my-12 grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <RefreshIcon className="h-10 w-10 mx-auto mb-3 text-brand-red" />
                                <h3 className="text-xl font-bold">Radical Simplicity</h3>
                                <p className="text-base">Powerful technology should feel effortless. Our interface is clean and intuitive because we believe your focus should be on your work, not on figuring out our tools.</p>
                            </div>
                            <div className="text-center">
                                <LockIcon className="h-10 w-10 mx-auto mb-3 text-brand-red" />
                                <h3 className="text-xl font-bold">Unbreakable Privacy</h3>
                                <p className="text-base">In an online world, your data's security is non-negotiable. By processing files directly in your browser, we ensure your documents remain your own. This isn't just a feature; it's a promise.</p>
                            </div>
                            <div className="text-center">
                                <GlobeIcon className="h-10 w-10 mx-auto mb-3 text-brand-red" />
                                <h3 className="text-xl font-bold">Global Accessibility</h3>
                                <p className="text-base">We are committed to providing free, accessible tools to everyone, everywhere. From students in classrooms to executives in boardrooms, our platform empowers users across the globe.</p>
                            </div>
                        </div>

                        <p>
                            The future of document management is intelligent, collaborative, and integrated. We are at the forefront of this evolution, pioneering AI-driven features that don't just process your documents but understand them. We're building solutions that will automate your workflows, provide deeper insights, and enable seamless collaboration for teams of any size.
                        </p>
                        <p>
                            Thank you for being part of our community and for trusting us with your documents. We are incredibly excited about the journey ahead and are dedicated to continuing to build tools that you will not only use but love.
                        </p>
                        <p>
                            Sincerely,
                        </p>
                        <p className="font-pacifico text-3xl text-gray-800 dark:text-gray-100 mt-4">
                            Bishal Mishra
                        </p>
                        <div className="mt-12 text-center">
                            <Link to="/about" className="inline-block bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
                                Learn More About Our Mission
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CeoPage;