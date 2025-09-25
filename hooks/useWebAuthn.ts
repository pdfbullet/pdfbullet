// src/hooks/useWebAuthn.ts
import { useAuth } from '../contexts/AuthContext.tsx';

const MOCK_RP_ID = window.location.hostname;
const MOCK_RP_NAME = 'PDFBullet';
const PASSKEYS_STORAGE_KEY = 'pdfbullet_passkeys';

export interface StoredCredential {
    id: string; // The base64url encoded credential ID
    name: string;
    createdAt: string;
}

// Helpers: base64url <-> ArrayBuffer
function base64urlToArrayBuffer(base64url: string) {
    const padding = "===".slice(0, (4 - (base64url.length % 4)) % 4);
    const base64 = (base64url + padding).replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
}

function arrayBufferToBase64url(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Helper to manage credentials in localStorage
const getStoredCredentials = (email: string): StoredCredential[] => {
    try {
        const allPasskeys = JSON.parse(localStorage.getItem(PASSKEYS_STORAGE_KEY) || '{}');
        return allPasskeys[email] || [];
    } catch {
        return [];
    }
};

const addStoredCredential = (email: string, newCredential: StoredCredential) => {
    try {
        const allPasskeys = JSON.parse(localStorage.getItem(PASSKEYS_STORAGE_KEY) || '{}');
        const userPasskeys = allPasskeys[email] || [];
        allPasskeys[email] = [...userPasskeys, newCredential];
        localStorage.setItem(PASSKEYS_STORAGE_KEY, JSON.stringify(allPasskeys));
    } catch (e) {
        console.error("Failed to save passkey to localStorage", e);
    }
};

const removeStoredCredential = (email: string, credentialID: string) => {
     try {
        const allPasskeys = JSON.parse(localStorage.getItem(PASSKEYS_STORAGE_KEY) || '{}');
        if (allPasskeys[email]) {
            allPasskeys[email] = allPasskeys[email].filter((c: StoredCredential) => c.id !== credentialID);
            localStorage.setItem(PASSKEYS_STORAGE_KEY, JSON.stringify(allPasskeys));
        }
    } catch (e) {
        console.error("Failed to remove passkey from localStorage", e);
    }
};


export const useWebAuthn = () => {
    const { user } = useAuth();
    const isWebAuthnSupported = typeof window !== "undefined" && !!(window.PublicKeyCredential && navigator.credentials);

    const register = async (email: string) => {
        if (!isWebAuthnSupported) throw new Error("WebAuthn is not supported on this device.");

        // 1. Simulate getting registration options from backend
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        const userId = new Uint8Array(16);
        window.crypto.getRandomValues(userId);
        
        const existingCredentials = getStoredCredentials(email);

        const options: PublicKeyCredentialCreationOptions = {
            challenge,
            rp: { name: MOCK_RP_NAME, id: MOCK_RP_ID },
            user: {
                id: userId,
                name: email,
                displayName: email,
            },
            pubKeyCredParams: [
                { type: "public-key", alg: -7 }, // ES256
                { type: "public-key", alg: -257 }, // RS256
            ],
            authenticatorSelection: {
                authenticatorAttachment: "platform",
                userVerification: "required",
                residentKey: "required",
            },
            timeout: 60000,
            attestation: "none",
            excludeCredentials: existingCredentials.map(cred => ({
                type: 'public-key',
                id: base64urlToArrayBuffer(cred.id),
            })),
        };

        // 2. Create credential using browser API
        const credential = await navigator.credentials.create({ publicKey: options });
        if (!credential) throw new Error("Credential creation was cancelled or failed.");

        // 3. Simulate sending to backend for verification
        const newStoredCredential: StoredCredential = {
            id: arrayBufferToBase64url((credential as any).rawId),
            name: `Passkey (${new Date().toLocaleDateString()})`,
            createdAt: new Date().toISOString(),
        };
        addStoredCredential(email, newStoredCredential);

        return { success: true };
    };

    const login = async (email: string) => {
        if (!isWebAuthnSupported) throw new Error("WebAuthn is not supported on this device.");

        // 1. Simulate getting login options from backend
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        const userCredentials = getStoredCredentials(email);

        if (userCredentials.length === 0) {
            throw new Error("No passkey found for this email. Please register a passkey first or try another login method.");
        }

        const options: PublicKeyCredentialRequestOptions = {
            challenge,
            rpId: MOCK_RP_ID,
            allowCredentials: userCredentials.map(cred => ({
                type: 'public-key',
                id: base64urlToArrayBuffer(cred.id),
            })),
            userVerification: "required",
            timeout: 60000,
        };

        // 2. Get assertion from browser API
        const assertion = await navigator.credentials.get({ publicKey: options });
        if (!assertion) throw new Error("Login was cancelled or failed.");
        
        // 3. Simulate backend verification and token generation
        // This mock token will be used by AuthContext to sign in the user.
        const mockJwt = `mock-jwt-for-${email}-${Date.now()}`;
        
        return { token: mockJwt };
    };
    
    const getCredentials = async (): Promise<StoredCredential[]> => {
        if (!user || !user.email) return [];
        return getStoredCredentials(user.email);
    };
    
    const removeCredential = async (credentialID: string): Promise<void> => {
        if (!user || !user.email) throw new Error("User not found");
        removeStoredCredential(user.email, credentialID);
    };

    return { register, login, isWebAuthnSupported, getCredentials, removeCredential };
};