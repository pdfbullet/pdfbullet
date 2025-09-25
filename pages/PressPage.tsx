
import React, { useEffect } from 'react';
// FIX: Replaced placeholder icons with the newly added Press-specific icons.
import { DownloadIcon, HeartbeatIcon, GlobeIcon, PressMobileIcon, PressDesktopIcon, PressUpdatesIcon } from '../components/icons.tsx';
import { Logo } from '../components/Logo.tsx';

// A simple 'B' icon styled to match the screenshot
const BIcon: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center justify-center font-sans font-bold text-4xl text-brand-red ${className}`}>
        B
    </div>
);

const PressPage: React.FC = () => {
    useEffect(() => {
        document.title = "Press Kit | PDFBullet";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "Download official PDFBullet logos, mockups, and learn more about our company's story and mission. All media resources in one place.");
        }
    }, []);

    const mediaKitItems = [
        { title: 'PDFBullet logos', image: '/logo.svg', downloadLink: '/logo.svg', downloadName: 'pdfbullet_logos.svg' },
        { title: 'Mockup desktop', image: 'https://ik.imagekit.io/fonepay/Desk%20top%20mockup.png?updatedAt=1756018431019', downloadLink: 'https://ik.imagekit.io/fonepay/Desk%20top%20mockup.png?updatedAt=1756018431019', downloadName: 'mockup_desktop.png' },
        { title: 'Mockup mobile', image: 'https://ik.imagekit.io/fonepay/mockup_mobile.png?updatedAt=1756018431039', downloadLink: 'https://ik.imagekit.io/fonepay/mockup_mobile.png?updatedAt=1756018431039', downloadName: 'mockup_mobile.png' },
        { title: 'Mockup web', image: 'https://ik.imagekit.io/fonepay/mockup_web%20PDFLY.png?updatedAt=1756018431063', downloadLink: 'https://ik.imagekit.io/fonepay/mockup_web%20PDFLY.png?updatedAt=1756018431063', downloadName: 'mockup_web.png' }
    ];

    const infoCards = [
        {
            title: 'PDFBullet Mobile',
            Icon: PressMobileIcon,
            content: <>In 2017, we launched our <a href="/#/" className="text-brand-red hover:underline">PDFBullet Mobile App</a> to make our tools accessible for all mobile users editing on the go.</>
        },
        {
            title: 'PDFBullet Desktop',
            Icon: PressDesktopIcon,
            content: <>In efforts to make PDFBullet suitable for Businesses and Corporations, we launched <a href="/#/" className="text-brand-red hover:underline">PDFBullet Desktop</a> application in 2018. Our desktop application runs offline and processes confidential files locally.</>
        },
        {
            title: 'Frequent updates',
            Icon: PressUpdatesIcon,
            content: <>In 2018, we also redesigned our website. Users can fully enjoy easier workflow, increased task limits, more tools and extended Premium service that includes our Desktop version.</>
        }
    ];
    
    const factCards = [
        {
            icon: BIcon,
            title: 'Who are we?',
            content: "Based in Kathmandu, since 2025 PDFBullet has offered user-friendly tools that anyone can use to save time with PDFs."
        },
        {
            icon: HeartbeatIcon,
            title: 'What do we do?',
            content: "Our site provides users with a free toolkit to make a wide range of edits to a wide range of files. What began as a simple website to merge and split PDFs; today offers more than 25 tools to organize, optimize, edit, convert, and secure PDFs."
        },
        {
            icon: GlobeIcon,
            title: 'Helping millions worldwide',
            content: "PDFBullet has built a community of millions of users from all over the world, speaks 25 languages and has processed more than 500 million files."
        }
    ];

    return (
        <div className="bg-gray-50 dark:bg-black py-16 md:py-24">
            <div className="container mx-auto px-6 space-y-20">

                <section>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100 text-center mb-12">Some facts about PDFBullet</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {factCards.map((card, index) => (
                            <div key={index} className="bg-white dark:bg-black p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                                <div className="flex justify-center mb-6">
                                     <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                        <card.icon className="h-12 w-12 text-brand-red" />
                                     </div>
                                </div>
                                <h2 className="text-xl font-bold text-center mb-4 text-gray-800 dark:text-gray-100">{card.title}</h2>
                                <p className="text-gray-600 dark:text-gray-400">{card.content}</p>
                            </div>
                        ))}
                    </div>
                </section>
                
                <section>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100 text-center mb-12">Media Kit</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {mediaKitItems.map((item, index) => (
                            <div key={index} className="bg-white dark:bg-black p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 text-center flex flex-col justify-between items-center">
                                <div className="flex-grow flex items-center justify-center mb-4 h-32">
                                    {item.title === 'PDFBullet logos' ? (
                                        <Logo className="h-16 w-auto" />
                                    ) : (
                                        <img src={item.image} alt={item.title} className="max-h-full max-w-full" />
                                    )}
                                </div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">{item.title}</h3>
                                <a href={item.downloadLink} download={item.downloadName} target="_blank" rel="noopener noreferrer" className="text-brand-red font-semibold hover:underline flex items-center gap-2">
                                    <DownloadIcon className="h-4 w-4" />
                                    Download
                                </a>
                            </div>
                        ))}
                    </div>
                </section>
                
                <section>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {infoCards.map((card, index) => (
                            <div key={index} className="bg-white dark:bg-black p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 text-center">
                                <card.Icon className="h-20 w-20 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{card.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{card.content}</p>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default PressPage;
