import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'pdfbullet_favorites_v1';

export const useFavorites = () => {
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        try {
            const storedFavorites = localStorage.getItem(FAVORITES_KEY);
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.error("Failed to parse favorites from localStorage", error);
            setFavorites([]);
        }
    }, []);

    const toggleFavorite = useCallback((toolId: string) => {
        setFavorites(prevFavorites => {
            const newFavorites = prevFavorites.includes(toolId)
                ? prevFavorites.filter(id => id !== toolId)
                : [...prevFavorites, toolId];
            
            try {
                localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
            } catch (error) {
                console.error("Failed to save favorites to localStorage", error);
            }
            return newFavorites;
        });
    }, []);

    const isFavorite = useCallback((toolId: string): boolean => {
        return favorites.includes(toolId);
    }, [favorites]);

    return { favorites, toggleFavorite, isFavorite };
};
