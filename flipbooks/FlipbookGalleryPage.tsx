import React, { useState, useEffect, useContext } from 'react';
import { Link } from '../utils/routerCompat.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { UserIcon } from '../components/icons.tsx';
import { getAllPublicFlipbooks, Flipbook } from '../hooks/useFlipbooks.ts';
import { LayoutContext } from '../App.tsx';

// Using a generic heart icon as a placeholder for "likes"
const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
);

const FlipbookCard: React.FC<{ flipbook: Flipbook }> = ({ flipbook }) => {
    const { user } = useAuth();
    const ownerDisplayName = (user && user.uid === flipbook.ownerId) ? 'You' : (flipbook.ownerName || 'Anonymous');

    return (
        <Link to={`/flip/${flipbook.id}`} className="block group bg-white dark:bg-black rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-900 overflow-hidden">
                <img src={flipbook.pageUrls[0]} alt={flipbook.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-4">
                <h3 className="font-bold text-lg truncate text-gray-800 dark:text-gray-100">{flipbook.title}</h3>
                <div className="mt-2 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        <UserIcon className="h-4 w-4" /> {ownerDisplayName}
                    </span>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><HeartIcon className="h-4 w-4" /> {flipbook.likes || 0}</span>
                        <span className="flex items-center gap-1">👁️ {flipbook.views || 0}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const FlipbookGalleryPage: React.FC = () => {
    const [flipbooks, setFlipbooks] = useState<Flipbook[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const { setShowFooter } = useContext(LayoutContext) as { setShowFooter: (show: boolean) => void; };

    useEffect(() => {
        setShowFooter(false);
        return () => setShowFooter(true);
    }, [setShowFooter]);

    useEffect(() => {
        const fetchFlipbooks = async () => {
            setLoading(true);
            try {
                const publicFlipbooks = await getAllPublicFlipbooks(user?.uid);
                setFlipbooks(publicFlipbooks);
            } catch (err) {
                console.error("Error fetching local flipbooks:", err);
                setError('Failed to load public flipbooks. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchFlipbooks();
    }, [user]);

    return (
        <div className="py-16 md:py-24 bg-gray-50 dark:bg-black min-h-screen">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">Public Flipbooks</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Explore a gallery of amazing flipbooks created by our community.
                    </p>
                </div>
                
                {loading && <div className="text-center text-gray-500">Loading flipbooks...</div>}
                {error && <div className="text-center text-red-500">{error}</div>}
                
                {!loading && !error && (
                    flipbooks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {flipbooks.map(fb => (
                                <FlipbookCard key={fb.id} flipbook={fb} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-20">
                            <h3 className="text-2xl font-bold">No public flipbooks yet.</h3>
                            <p className="mt-2">Why not be the first to share one?</p>
                             <Link to="/flipbooks/upload" className="mt-6 inline-block bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-8 rounded-lg transition-colors">
                                Create a Flipbook
                            </Link>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default FlipbookGalleryPage;