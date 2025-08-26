
import { useState, useEffect, useCallback } from 'react';

const SIGNATURE_KEY = 'ilovepdfly_user_signature';

export const useSignature = () => {
    const [signature, setSignature] = useState<string | null>(null);

    useEffect(() => {
        try {
            const storedSignature = localStorage.getItem(SIGNATURE_KEY);
            if (storedSignature) {
                setSignature(storedSignature);
            }
        } catch (error) {
            console.error("Failed to load signature from localStorage", error);
        }
    }, []);

    const saveSignature = useCallback((dataUrl: string) => {
        try {
            localStorage.setItem(SIGNATURE_KEY, dataUrl);
            setSignature(dataUrl);
        } catch (error) {
            console.error("Failed to save signature to localStorage", error);
        }
    }, []);

    const deleteSignature = useCallback(() => {
        try {
            localStorage.removeItem(SIGNATURE_KEY);
            setSignature(null);
        } catch (error) {
            console.error("Failed to delete signature from localStorage", error);
        }
    }, []);

    return { signature, saveSignature, deleteSignature };
};
