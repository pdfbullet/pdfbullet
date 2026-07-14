import React, { useEffect, useContext } from 'react';
import { Link } from '../utils/routerCompat.tsx';
import { StarIcon, EyeIcon } from '../components/icons.tsx';
import { LayoutContext } from '../App.tsx';
import { demoFlipbooks } from './demoData.ts';

const FlipbookLandingPage: React.FC = () => {
    const { setShowFooter } = useContext(LayoutContext) as { setShowFooter: (show: boolean) => void; };

    useEffect(() => {
        document.title = "Interactive HTML5 Flipbook Publishing Platform | PDFBullet";
        setShowFooter(false);
        return () => setShowFooter(true);
    }, [setShowFooter]);

    const features = [
        '3D Realistic Page-flipping Effect.',
        'Built-in Templates, Scenes, and Themes.',
        'Custom Domain.',
        'Publication Download.',
        'Publication Protection.',
        'Unlimited Cloud Hosting.',
        'Google Analytics Integration.',
        'Social Media Integration.',
        'Bookshelf Integration.'
    ];

    const booksOnShelf1 = demoFlipbooks.slice(0, 3);
    const booksOnShelf2 = demoFlipbooks.slice(3, 6);

    // Helper to render book links with 3D perspective styling
    const renderBook = (book: any) => (
        <Link key={book.id} to={`/flip/${book.id}`} title={`View Demo: ${book.title}`} className="book-container group">
            <img src={book.coverUrl} alt={book.title} className="book-cover object-contain" />
            {/* Hover Overlay with Eye Icon */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <EyeIcon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                </div>
            </div>
        </Link>
    );

    return (
        <div
            className="min-h-screen w-full bg-cover bg-center text-white"
            style={{ backgroundImage: "url('https://ik.imagekit.io/fonepay/banner%20main%20bg.png?updatedAt=1762081564871')" }}
        >
            <div className="min-h-screen w-full bg-black/40 flex flex-col justify-center items-center px-4 py-16">
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                    <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-wider">
                        INTERACTIVE HTML5 FLIPPING BOOK PUBLISHING PLATFORM
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-gray-300">
                        for Magazines, Catalogs, Brochures and more
                    </p>
                    <p className="mt-2 text-md md:text-lg text-gray-300">
                        Read, upload, and share publications
                    </p>
                </div>

                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-16 items-center mt-12 md:mt-20">
                    {/* Left Column */}
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-semibold">
                            Convert your PDF into an interactive HTML5 flipbook in minutes.
                        </h2>
                        <ul className="mt-6 space-y-3 text-gray-200">
                            {features.map((feature, i) => (
                                <li key={i} className="flex items-start">
                                    <span className="text-purple-400 mr-2">◆</span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-8 inline-flex flex-col items-center">
                            <Link
                                to="/dashboard/my-flipbooks"
                                className="shiny-cta-button"
                            >
                                MAKE A FLIPPING BOOK ONLINE
                            </Link>
                            <a href="https://www.trustpilot.com/review/pdfbullet.com" target="_blank" rel="noopener noreferrer" className="group mt-3 flex items-center gap-2">
                                <img src="https://ik.imagekit.io/fonepay/flipbook%20/trustpilot.png?updatedAt=1762100612831" alt="Trustpilot reviews" className="h-6 transition-transform group-hover:scale-105" />
                            </a>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="w-full flex-col justify-center items-center space-y-8 hidden md:flex">
                        {/* Top Shelf */}
                        <div className="relative w-full max-w-2xl mx-auto">
                            <img src="https://ik.imagekit.io/fonepay/book%20holder.png?updatedAt=1762083381621" alt="Bookshelf" className="w-full h-auto book-shelf" />
                             <div className="absolute top-0 left-0 right-0 flex justify-around items-end px-12 lg:px-16 transform -translate-y-full mt-8 lg:mt-10">
                                {booksOnShelf1.map(book => renderBook(book))}
                            </div>
                        </div>
                        {/* Bottom Shelf */}
                        <div className="relative w-full max-w-2xl mx-auto">
                            <img src="https://ik.imagekit.io/fonepay/book%20holder.png?updatedAt=1762083381621" alt="Bookshelf" className="w-full h-auto book-shelf" />
                            <div className="absolute top-0 left-0 right-0 flex justify-around items-end px-12 lg:px-16 transform -translate-y-full mt-8 lg:mt-10">
                                {booksOnShelf2.map(book => renderBook(book))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlipbookLandingPage;