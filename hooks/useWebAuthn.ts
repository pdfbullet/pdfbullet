// src/hooks/useWebAuthn.ts

const API_BASE_URL = "https://ilovepdfly-backend.onrender.com"; // backend URL

export const useWebAuthn = (username: string) => {
  const register = async () => {
    try {
      // 1. Get registration options from backend
      const optionsRes = await fetch(`${API_BASE_URL}/webauthn/register/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const options = await optionsRes.json();

      // 2. Ask authenticator to create a credential
      const cred = await navigator.credentials.create({
        publicKey: options,
      });

      // 3. Send credential to backend for verification
      const verifyRes = await fetch(`${API_BASE_URL}/webauthn/register/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cred),
      });
      return await verifyRes.json();
    } catch (err) {
      console.error("Registration failed:", err);
      throw err;
    }
  };

  const login = async () => {
    try {
      // 1. Get login options from backend
      const optionsRes = await fetch(`${API_BASE_URL}/webauthn/login/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const options = await optionsRes.json();

      // 2. Ask authenticator for an assertion
      const assertion = await navigator.credentials.get({
        publicKey: options,
      });

      // 3. Send assertion to backend for verification
      const verifyRes = await fetch(`${API_BASE_URL}/webauthn/login/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assertion),
      });
      return await verifyRes.json();
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  };

  return { register, login };
};
