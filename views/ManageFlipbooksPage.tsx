import React, { useState, useEffect, Suspense, useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { HomeIcon, RssIcon, FavoritesIcon, FolderIcon, BookcaseIcon, TicketIcon, BillingIcon, CogIcon, PlusIcon, MenuIcon, CloseIcon, UserIcon } from '../components/icons.tsx';
import { LayoutContext } from '../App.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { getAllPublicFlipbooks, Flipbook } from '../hooks/useFlipbooks.ts';

// Lazy load the section components for better performance
const HomepageView = React.lazy(() => import('./manage-flipbooks/HomepageView.tsx'));
const SettingsView = React.lazy(() => import('./manage-flipbooks/SettingsView.tsx'));
const ManageBooksView = React.lazy(() => import('./manage-flipbooks/ManageBooksView.tsx'));
const PlaceholderView = React.lazy(() => import('./manage-flipbooks/PlaceholderView.tsx'));
const ExploreView = React.lazy(() => import('./manage-flipbooks/ExploreView.tsx'));
const SubmitTicketView = React.lazy(() => import('./manage-flipbooks/SubmitTicketView.tsx'));
const BillingView = React.lazy(() => import('./manage-flipbooks/BillingView.tsx'));


// --- START OF NEW COMPONENT: FavoritesView ---
const FavoriteBookCard: React.FC<{ book: Flipbook }> = ({ book }) => {
    const { user } = useAuth();
    const ownerDisplayName = (user && user.uid === book.ownerId) ? 'You' : (book.ownerName || 'Anonymous');

    return (
        <div className="bg-white/10 dark:bg-black/50 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 rounded-lg shadow-xl overflow-hidden group">
            <Link to={`/flip/${book.id}`} className="block">
                <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-900">
                    <img src={book.pageUrls[0]} alt={book.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
            </Link>
            <div className="p-4">
                <h3 className="font-semibold text-white dark:text-gray-100 truncate" title={book.title}>{book.title}</h3>
                <div className="mt-2 flex justify-between items-center text-sm text-gray-300 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        <UserIcon className="h-4 w-4" /> {ownerDisplayName}
                    </span>
                    <div className="flex items-center gap-1 text-red-400">
                        <FavoritesIcon className="h-4 w-4" />
                        <span>{book.likes || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FavoritesView: React.FC = () => {
    const { user } = useAuth();
    const [favoriteBooks, setFavoriteBooks] = useState<Flipbook[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            setError('');
            if (!user) {
                setFavoriteBooks([]);
                setLoading(false);
                return;
            }

            try {
                // This fetches all public books, and the current user's private books.
                const allVisibleBooks = await getAllPublicFlipbooks(user.uid);

                const likedBooks = allVisibleBooks.filter(book => book.likedBy && book.likedBy.includes(user.uid));
                setFavoriteBooks(likedBooks);

            } catch (e) {
                setError('Could not load your favorite flipbooks. Please try again later.');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [user]);

    if (loading) {
        return <div className="text-white text-center p-10">Loading your favorites...</div>;
    }

    if (error) {
        return <div className="text-red-400 text-center p-10">{error}</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Favorites</h1>
            {favoriteBooks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {favoriteBooks.map((book) => (
                        <FavoriteBookCard key={book.id} book={book} />
                    ))}
                </div>
            ) : (
                <div className="bg-white/10 dark:bg-black/50 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 p-12 rounded-lg shadow-xl text-center">
                    <FavoritesIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold text-white dark:text-gray-100">No favorites yet</h3>
                    <p className="text-gray-300 dark:text-gray-400 mt-2">
                        Click the heart icon on any flipbook to add it to your favorites.
                    </p>
                    <Link to="/flipbooks/public" className="mt-6 inline-block bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-6 rounded-md transition-colors">
                        Explore Flipbooks
                    </Link>
                </div>
            )}
        </div>
    );
};
// --- END OF NEW COMPONENT ---


const ManageFlipbooksPage: React.FC = () => {
    const { user } = useAuth();
    const [activeView, setActiveView] = useState('homepage');
    const [activeFolder, setActiveFolder] = useState<string | null>(null);
    const [folders, setFolders] = useState<string[]>(['Default']);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { setShowFooter } = useContext(LayoutContext);

    useEffect(() => {
        setShowFooter(false);
        return () => {
            setShowFooter(true);
        };
    }, [setShowFooter]);
    
    useEffect(() => {
        // Set a default view if none is active
        if (!activeView && !activeFolder) {
            setActiveView('homepage');
        }
    }, [activeView, activeFolder]);

    useEffect(() => {
        try {
            const storedFolders = localStorage.getItem('flipbook_folders');
            if (storedFolders) {
                setFolders(JSON.parse(storedFolders));
            } else {
                localStorage.setItem('flipbook_folders', JSON.stringify(['Default']));
            }
        } catch (e) {
            console.error("Failed to load folders from localStorage", e);
        }
    }, []);

    const addFolder = () => {
        const newFolderName = prompt("Enter new folder name:");
        if (newFolderName && !folders.includes(newFolderName)) {
            const newFolders = [...folders, newFolderName];
            setFolders(newFolders);
            localStorage.setItem('flipbook_folders', JSON.stringify(newFolders));
        }
    };

    const renderView = () => {
        if (activeFolder) {
            return <ManageBooksView folder={activeFolder} />;
        }
        switch (activeView) {
            case 'homepage':
                return <HomepageView />;
            case 'settings':
                return <SettingsView />;
            case 'following':
                return <ExploreView />;
            case 'favorites':
                return <FavoritesView />;
            case 'submit-ticket':
                return <SubmitTicketView />;
            case 'billing':
                return <BillingView />;
            case 'my-bookcases':
                 return <PlaceholderView title="My Bookcases" />;
            default:
                return <HomepageView />;
        }
    };
    
    const handleSidebarClick = (view: string) => {
        setActiveView(view);
        setActiveFolder(null);
        setIsSidebarOpen(false);
    };

    const handleFolderClick = (folder: string) => {
        setActiveView('manage-books');
        setActiveFolder(folder);
        setIsSidebarOpen(false);
    };

    const SidebarContent = () => (
         <>
            <div className="flex justify-between items-center md:block">
                <div className="mb-6">
                    <span className="text-gray-300 font-bold">FREE</span>
                    <NavLink to="/pricing" className="ml-2 text-yellow-400 font-bold hover:underline">Upgrade</NavLink>
                </div>
                <button className="md:hidden text-gray-300" onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar">
                    <CloseIcon className="h-6 w-6" />
                </button>
            </div>
            <nav className="space-y-1">
                <button onClick={() => handleSidebarClick('homepage')} className={`w-full flex items-center gap-3 p-2 rounded-md text-sm font-semibold ${activeView === 'homepage' && !activeFolder ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-700'}`}>
                    <HomeIcon className="h-5 w-5" /> Homepage
                </button>
                <button onClick={() => handleSidebarClick('following')} className={`w-full flex items-center gap-3 p-2 rounded-md text-sm font-semibold ${activeView === 'following' ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-700'}`}>
                   <RssIcon className="h-5 w-5" /> Following
                </button>
                <button onClick={() => handleSidebarClick('favorites')} className={`w-full flex items-center gap-3 p-2 rounded-md text-sm font-semibold ${activeView === 'favorites' ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-700'}`}>
                    <FavoritesIcon className="h-5 w-5" /> Favorites
                </button>
                
                <div className="pt-4">
                    <div className="flex justify-between items-center px-2 mb-2">
                        <h3 className="text-xs font-bold uppercase text-gray-400">My Flips</h3>
                        <button onClick={addFolder} className="text-blue-400"><PlusIcon className="h-4 w-4" /></button>
                    </div>
                    {folders.map(folder => (
                        <button key={folder} onClick={() => handleFolderClick(folder)} className={`w-full flex items-center gap-3 p-2 rounded-md text-sm font-semibold ${activeFolder === folder ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-700'}`}>
                            <FolderIcon className="h-5 w-5" /> {folder}
                        </button>
                    ))}
                </div>
                
                <div className="pt-4">
                     <div className="flex justify-between items-center px-2 mb-2">
                        <h3 className="text-xs font-bold uppercase text-gray-400">My Bookcases</h3>
                        <button onClick={() => alert('This feature is coming soon!')} className="text-blue-400"><PlusIcon className="h-4 w-4" /></button>
                    </div>
                    {user && (
                        <button onClick={() => handleSidebarClick('my-bookcases')} className={`w-full flex items-center gap-3 p-2 rounded-md text-sm font-semibold ${activeView === 'my-bookcases' && activeFolder === user.username ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-700'}`}>
                           <BookcaseIcon className="h-5 w-5" /> {user.username}
                       </button>
                    )}
                </div>

                 <div className="pt-4 space-y-1">
                     <button onClick={() => handleSidebarClick('submit-ticket')} className={`w-full flex items-center gap-3 p-2 rounded-md text-sm font-semibold ${activeView === 'submit-ticket' ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-700'}`}>
                        <TicketIcon className="h-5 w-5" /> Submit a ticket
                    </button>
                    <button onClick={() => handleSidebarClick('billing')} className={`w-full flex items-center gap-3 p-2 rounded-md text-sm font-semibold ${activeView === 'billing' ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-700'}`}>
                        <BillingIcon className="h-5 w-5" /> Billing
                    </button>
                    <button onClick={() => handleSidebarClick('settings')} className={`w-full flex items-center gap-3 p-2 rounded-md text-sm font-semibold ${activeView === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-700'}`}>
                        <CogIcon className="h-5 w-5" /> Settings
                    </button>
                </div>
            </nav>
        </>
    );

    return (
        <div className="min-h-screen dashboard-bg">
            <div className="flex">
                {/* Static Sidebar for Desktop */}
                <aside className="hidden md:block w-56 bg-gray-900 p-4 min-h-screen flex-shrink-0">
                    <SidebarContent />
                </aside>
                
                {/* Mobile Sidebar (Drawer) */}
                <div 
                    className={`fixed inset-0 z-40 transition-opacity bg-black/50 md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
                <aside 
                    className={`fixed inset-y-0 left-0 z-50 w-56 bg-gray-900 p-4 transition-transform duration-300 ease-in-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <SidebarContent />
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 overflow-auto">
                    {/* Mobile Header with Hamburger */}
                    <div className="md:hidden mb-4 flex items-center">
                         <button 
                            onClick={() => setIsSidebarOpen(true)}
                            aria-label="Open sidebar"
                            className="p-2 -ml-2 text-white bg-black/20 rounded-full"
                        >
                            <MenuIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <Suspense fallback={<div className="text-white text-center p-10">Loading...</div>}>
                        {renderView()}
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

export default ManageFlipbooksPage;