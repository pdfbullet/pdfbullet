import { useState, useEffect, useCallback } from 'react';

// ===================================================================
// TYPES & HELPERS
// ===================================================================

// This interface is used by the SecurityPage to display credentials
export interface StoredCredential {
  id: string; // base64url encoded
  createdAt: string;
  name: string;
}

// --- Base64URL Conversion Helpers ---
// https://www.w3.org/TR/webauthn-2/#sctn-base64url-encoding
function bufferToBase64URL(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const charCode of bytes) {
    str += String.fromCharCode(charCode);
  }
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64URLToBuffer(base64url: string): ArrayBuffer {
  // Add padding and convert to standard base64
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (base64.length % 4)) % 4;
  base64 += '='.repeat(padLength);

  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i);
  }
  return buffer;
}


// ===================================================================
// MAIN HOOK
// ===================================================================
const API_BASE_URL = 'https://ilovepdfly-backend.onrender.com';

export const useWebAuthn = () => {
    const [isWebAuthnSupported, setIsWebAuthnSupported] = useState(false);
    
    useEffect(() => {
        setIsWebAuthnSupported(
            typeof window !== 'undefined' &&
            navigator.credentials &&
            typeof PublicKeyCredential !== 'undefined'
        );
    }, []);

    const register = useCallback(async (email: string) => {
        if (!isWebAuthnSupported) {
            throw new Error('WebAuthn is not supported on this device.');
        }

        // 1. Get registration options from the backend
        const optionsRes = await fetch(`${API_BASE_URL}/api/passkey/register-options`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        if (!optionsRes.ok) throw new Error('Failed to get registration options from server.');
        const options = await optionsRes.json();
        
        // Convert challenge and user.id from base64url to ArrayBuffer
        options.challenge = base64URLToBuffer(options.challenge);
        options.user.id = base64URLToBuffer(options.user.id);

        // 2. Call navigator.credentials.create()
        const credential = await navigator.credentials.create({
            publicKey: options,
        }) as PublicKeyCredential | null;

        if (!credential) {
            throw new Error('Registration failed or was cancelled.');
        }
        
        // 3. Send the credential to the backend for verification
        const attestationResponse = credential.response as AuthenticatorAttestationResponse;
        const verificationData = {
            id: credential.id,
            rawId: bufferToBase64URL(credential.rawId),
            type: credential.type,
            response: {
                clientDataJSON: bufferToBase64URL(attestationResponse.clientDataJSON),
                attestationObject: bufferToBase64URL(attestationResponse.attestationObject),
            },
        };

        const verifyRes = await fetch(`${API_BASE_URL}/api/passkey/register-verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(verificationData),
        });

        if (!verifyRes.ok) throw new Error('Failed to verify registration on server.');
        const verificationResult = await verifyRes.json();
        if (!verificationResult.verified) {
             throw new Error('Server could not verify the registration.');
        }
        
        return verificationResult;
    }, [isWebAuthnSupported]);


    const login = useCallback(async (email: string) => {
        if (!isWebAuthnSupported) {
            throw new Error('WebAuthn is not supported on this device.');
        }

        // 1. Get login options from the backend
        const optionsRes = await fetch(`${API_BASE_URL}/api/passkey/login-options`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
         if (!optionsRes.ok) {
            const errorData = await optionsRes.json();
            throw new Error(errorData.message || 'No passkeys found for this email.');
         }
        const options = await optionsRes.json();
        
        // Convert challenge and allowCredentials IDs from base64url to ArrayBuffer
        options.challenge = base64URLToBuffer(options.challenge);
        options.allowCredentials.forEach((cred: any) => {
            cred.id = base64URLToBuffer(cred.id);
        });

        // 2. Call navigator.credentials.get()
        const assertion = await navigator.credentials.get({
            publicKey: options,
        }) as PublicKeyCredential | null;

        if (!assertion) {
            throw new Error('Login failed or was cancelled.');
        }
        
        // 3. Send assertion to backend for verification
        const authResponse = assertion.response as AuthenticatorAssertionResponse;
        const verificationData = {
            id: assertion.id,
            rawId: bufferToBase64URL(assertion.rawId),
            type: assertion.type,
            response: {
                clientDataJSON: bufferToBase64URL(authResponse.clientDataJSON),
                authenticatorData: bufferToBase64URL(authResponse.authenticatorData),
                signature: bufferToBase64URL(authResponse.signature),
                userHandle: authResponse.userHandle ? bufferToBase64URL(authResponse.userHandle) : null,
            },
        };

        const verifyRes = await fetch(`${API_BASE_URL}/api/passkey/login-verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(verificationData),
        });
        
        if (!verifyRes.ok) throw new Error('Failed to verify login on server.');
        const verificationResult = await verifyRes.json();
        if (!verificationResult.verified) {
            throw new Error('Server could not verify the login assertion.');
        }

        return verificationResult;

    }, [isWebAuthnSupported]);

    return {
        isWebAuthnSupported,
        register,
        login,
    };
};