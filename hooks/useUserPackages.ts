import { useState, useEffect } from 'react';

export interface UserPackages {
    signatures: number;
    sms: number;
}

const PACKAGES_KEY = 'ilovepdfly_user_packages_v1';

const initialPackages: UserPackages = {
    signatures: 0,
    sms: 0,
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

    return { packages, setPackages };
};
