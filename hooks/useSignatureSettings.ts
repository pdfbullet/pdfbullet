import { useState, useEffect } from 'react';

export interface SignatureSettings {
    uuid: boolean;
    verificationCode: boolean;
    emailBranding: boolean;
    emailNotifications: boolean;
    reminders: boolean;
    reminderFrequency: number;
    digitalSignature: boolean;
    language: string;
    customizeEmail: boolean;
    signingOrder: boolean;
    expiration: boolean;
    expirationDays: number;
    multipleRequests: boolean;
}

const SETTINGS_KEY = 'pdfbullet_signature_settings_v1';

const initialSettings: SignatureSettings = {
    uuid: true,
    verificationCode: false,
    emailBranding: false,
    emailNotifications: true,
    reminders: true,
    reminderFrequency: 1,
    digitalSignature: false,
    language: 'en',
    customizeEmail: false,
    signingOrder: false,
    expiration: true,
    expirationDays: 15,
    multipleRequests: false,
};

// Helper to get settings from localStorage
const getStoredSettings = (): SignatureSettings => {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            // Merge stored settings with initial settings to handle new keys
            return { ...initialSettings, ...JSON.parse(stored) };
        }
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(initialSettings));
        return initialSettings;
    } catch (error) {
        console.error("Failed to parse signature settings from localStorage", error);
        return initialSettings;
    }
};

export const useSignatureSettings = () => {
    const [settings, setSettings] = useState<SignatureSettings>(getStoredSettings);

    useEffect(() => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error("Failed to save signature settings to localStorage", error);
        }
    }, [settings]);

    return { settings, setSettings };
};
