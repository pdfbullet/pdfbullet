import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { exploreFlipbooks, DemoFlipbook } from './exploreData.ts';
import { FavoritesIcon, RefreshIcon, SearchIcon, SortAscIcon } from '../../components/icons.tsx';
import { useFavorites } from '../../hooks/useFavorites.ts';
import ShareModal from '../../components/ShareModal.tsx';

const ExploreCard: React.FC<{ book: DemoFlipbook, isHot?: boolean, isLiked: boolean, onLike: (id: string) => void, onShare: (book: DemoFlipbook) => void }> = ({ book, isHot, isLiked, onLike, onShare }) => {
    const details = { issue: book.issue, magazine: book.magazine };
    
    return (
        <div className="bg-white/10 dark:bg-black/50 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 rounded-lg shadow-xl overflow-hidden group">
            <Link to={`/flip/${book.id}`} className="block">
                <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-900">
                    <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    {isHot && (
                        <div className="absolute top-0 right-0 w-16 h-16">
                            <div className="absolute transform rotate-45 bg-orange-500 text-center text-white font-semibold py-1 right-[-34px] top-[15px] w-[100px]">
                                HOT
                            </div>
                        </div>
                    )}
                </div>
            </Link>
            <div className="p-4">
                <h3 className="font-semibold text-white dark:text-gray-100 truncate" title={book.title}>{details.issue}</h3>
                <p className="text-sm text-blue-400 hover:underline cursor-pointer">{details.magazine}</p>
                <div className="mt-3 pt-3 border-t border-gray-400/50 dark:border-gray-600/50 flex items-center justify-end gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onLike(book.id); }} className={`p-1 hover:text-red-500 ${isLiked ? 'text-red-500' : 'text-gray-400'}`} title="Add to favorites">
                        <FavoritesIcon className="h-5 w-5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onShare(book); }} className="p-1 text-gray-400 hover:text-blue-500" title="Share">
                        <RefreshIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const ExploreView: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('Newest');
    const { isFavorite, toggleFavorite } = useFavorites();
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [bookToShare, setBookToShare] = useState<DemoFlipbook | null>(null);

    const categories = useMemo(() => {
        const allCategories = new Set(exploreFlipbooks.map(book => book.category));
        return ['All', ...Array.from(allCategories).sort()];
    }, []);

    const handleShare = (book: DemoFlipbook) => {
        setBookToShare(book);
        setShareModalOpen(true);
    };

    const filteredAndSortedFlipbooks = useMemo(() => {
        let books = [...exploreFlipbooks];

        if (selectedCategory !== 'All') {
            books = books.filter(book => book.category === selectedCategory);
        }

        if (searchTerm.trim() !== '') {
            const lowercasedTerm = searchTerm.toLowerCase();
            books = books.filter(book => 
                book.title.toLowerCase().includes(lowercasedTerm) ||
                book.magazine.toLowerCase().includes(lowercasedTerm)
            );
        }
        
        switch (sortOrder) {
            case 'Title A-Z':
                books.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'Title Z-A':
                books.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'Newest':
            default:
                // Assuming original array is sorted by newest
                break;
        }

        return books;
    }, [selectedCategory, searchTerm, sortOrder]);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-2xl font-bold text-white border-b-4 border-yellow-400 pb-1">
                    Explore
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
                    <div className="relative">
                        <input 
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-white/10 dark:bg-black/50 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 rounded-md p-2 pl-8 focus:ring-yellow-400 focus:border-yellow-400 text-sm w-40 text-white dark:text-white placeholder-gray-300"
                        />
                        <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                     <select 
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="bg-white/10 dark:bg-black/50 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 rounded-md p-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm text-white dark:text-white"
                    >
                        <option>Newest</option>
                        <option>Title A-Z</option>
                        <option>Title Z-A</option>
                    </select>
                    <select 
                        id="category-select" 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-white/10 dark:bg-black/50 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 rounded-md p-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm text-white dark:text-white"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            {filteredAndSortedFlipbooks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredAndSortedFlipbooks.map((book, index) => (
                        <ExploreCard
                            key={book.id}
                            book={book}
                            isHot={index < 3 && selectedCategory === 'All' && searchTerm === '' && sortOrder === 'Newest'}
                            isLiked={isFavorite(book.id)}
                            onLike={toggleFavorite}
                            onShare={handleShare}
                        />
                    ))}
                </div>
            ) : (
                 <div className="bg-white/10 dark:bg-black/50 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 p-12 rounded-lg shadow-xl text-center">
                    <SearchIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold text-white dark:text-gray-100">No Results Found</h3>
                    <p className="text-gray-200 dark:text-gray-300 mt-2">
                        Try adjusting your search or filter criteria.
                    </p>
                </div>
            )}

            {bookToShare && (
                <ShareModal 
                    isOpen={shareModalOpen}
                    onClose={() => setShareModalOpen(false)}
                    url={`${window.location.origin}/flip/${bookToShare.id}`}
                    title={bookToShare.title}
                    coverUrl={bookToShare.coverUrl}
                />
            )}
        </div>
    );
};

export default ExploreView;