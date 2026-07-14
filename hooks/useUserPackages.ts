import { useState, useEffect, useCallback } from 'react';

export interface UserPackages {
    signatures: number;
    sms: number;
}

const PACKAGES_KEY = 'pdfbullet_user_packages_v1';

const initialPackages: UserPackages = {
    signatures: 10, // Start with some initial signatures for demo
    sms: 5,
};

const getStoredPackages = (): UserPackages => {
    try {
        const stored = localStorage.getItem(PACKAGES_KEY);
        if (stored) {
            return { ...initialPackages, ...JSON.parse(stored) };
        }
        localStorage.setItem(PACKAGES_KEY, JSON.stringify(initialPackages));
        return initialPackages;
    } catch (error) {
        console.error("Failed to parse user packages from localStorage", error);
        return initialPackages;
    }
};

export const useUserPackages = () => {
    const [packages, setPackages] = useState<UserPackages>(getStoredPackages);

    useEffect(() => {
        try {
            localStorage.setItem(PACKAGES_KEY, JSON.stringify(packages));
        } catch (error) {
            console.error("Failed to save user packages to localStorage", error);
        }
    }, [packages]);
    
    const addSignatures = useCallback((count: number) => {
        setPackages(prev => ({
            ...prev,
            signatures: prev.signatures + count
        }));
    }, []);

    const addSms = useCallback((count: number) => {
        setPackages(prev => ({
            ...prev,
            sms: prev.sms + count
        }));
    }, []);

    return { packages, addSignatures, addSms };
};
