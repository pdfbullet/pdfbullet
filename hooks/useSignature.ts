import { useState, useEffect, useCallback } from 'react';

const SIGNATURE_KEY = 'ilovepdfly_user_signature';

export interface SignatureData {
    signature: string | null;
    initials: string | null;
}

export const useSignature = () => {
    const [signature, setSignature] = useState<SignatureData | null>(null);

    useEffect(() => {
        try {
            const storedSignature = localStorage.getItem(SIGNATURE_KEY);
            if (storedSignature) {
                // Check for legacy string format
                if (storedSignature.startsWith('data:image/png;base64,')) {
                    const legacySignature = { signature: storedSignature, initials: null };
                    setSignature(legacySignature);
                    // Upgrade to new format in storage
                    localStorage.setItem(SIGNATURE_KEY, JSON.stringify(legacySignature));
                } else {
                    setSignature(JSON.parse(storedSignature));
                }
            }
        } catch (error) {
            console.error("Failed to load signature from localStorage", error);
        }
    }, []);

    const saveSignature = useCallback((signatureDataUrl: string, initialsDataUrl: string) => {
        try {
            const signatureData: SignatureData = {
                signature: signatureDataUrl,
                initials: initialsDataUrl,
            };
            localStorage.setItem(SIGNATURE_KEY, JSON.stringify(signatureData));
            setSignature(signatureData);
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
