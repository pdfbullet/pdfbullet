import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { getAllPublicFlipbooks, Flipbook } from '../../hooks/useFlipbooks.ts';
import { UserIcon, FavoritesIcon } from '../../components/icons.tsx';

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

export default FavoritesView;