// src/hooks/useWebAuthn.ts
const API_BASE_URL = "https://ilovepdfly-backend.onrender.com";

export interface StoredCredential {
    id: string;
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

export const useWebAuthn = () => {
  const isWebAuthnSupported =
    typeof window !== "undefined" && !!(window.PublicKeyCredential && navigator.credentials);

  const register = async (email: string) => {
    if (!email) throw new Error("Email is required to register a passkey.");

    // 1) Get registration options from backend
    const res = await fetch(`${API_BASE_URL}/webauthn/register/options`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || "Failed to get registration options from server.");
    }
    const options = await res.json();

    // Convert challenge and user.id to ArrayBuffer
    options.challenge = base64urlToArrayBuffer(options.challenge);
    options.user.id = base64urlToArrayBuffer(options.user.id);
    if (options.excludeCredentials) {
      options.excludeCredentials = options.excludeCredentials.map((c: any) => ({
        ...c,
        id: base64urlToArrayBuffer(c.id),
      }));
    }

    // 2) Create credential
    const credential: any = await navigator.credentials.create({ publicKey: options });
    if (!credential) throw new Error("Credential creation was cancelled or failed.");

    // 3) Prepare JSON safe object
    const credentialJSON = {
      id: credential.id,
      rawId: arrayBufferToBase64url(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: arrayBufferToBase64url(credential.response.clientDataJSON),
        attestationObject: arrayBufferToBase64url(credential.response.attestationObject),
      },
    };

    // 4) Send to backend for verification
    const verifyRes = await fetch(`${API_BASE_URL}/webauthn/register/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: credentialJSON, email }),
    });
    if (!verifyRes.ok) {
      const err = await verifyRes.json().catch(() => null);
      throw new Error(err?.message || "Failed to verify registration on server.");
    }
    return await verifyRes.json();
  };

  const login = async (email: string) => {
    if (!email) throw new Error("Email is required to login with passkey.");

    // 1) Get login options
    const res = await fetch(`${API_BASE_URL}/webauthn/login/options`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || "Failed to get login options from server.");
    }
    const options = await res.json();

    // Convert challenge and allowCredentials ids
    options.challenge = base64urlToArrayBuffer(options.challenge);
    if (options.allowCredentials) {
      options.allowCredentials = options.allowCredentials.map((c: any) => ({
        ...c,
        id: base64urlToArrayBuffer(c.id),
      }));
    }

    // 2) Get assertion
    const assertion: any = await navigator.credentials.get({ publicKey: options });
    if (!assertion) throw new Error("Assertion failed or was cancelled.");

    // 3) Prepare JSON safe object
    const assertionJSON = {
      id: assertion.id,
      rawId: arrayBufferToBase64url(assertion.rawId),
      type: assertion.type,
      response: {
        clientDataJSON: arrayBufferToBase64url(assertion.response.clientDataJSON),
        authenticatorData: arrayBufferToBase64url(assertion.response.authenticatorData),
        signature: arrayBufferToBase64url(assertion.response.signature),
        userHandle: assertion.response.userHandle
          ? arrayBufferToBase64url(assertion.response.userHandle)
          : null,
      },
    };

    // 4) Send to backend for verification
    const verifyRes = await fetch(`${API_BASE_URL}/webauthn/login/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: assertionJSON, email }),
    });
    if (!verifyRes.ok) {
      const err = await verifyRes.json().catch(() => null);
      throw new Error(err?.message || "Failed to verify login on server.");
    }
    return await verifyRes.json();
  };

  return { register, login, isWebAuthnSupported };
};