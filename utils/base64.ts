
// WebAuthn uses ArrayBuffers for IDs and challenges, but they need to be sent to the server as base64url strings.
// These helpers handle the conversion.

/**
 * Encodes an ArrayBuffer into a base64url string.
 */
export function encode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Decodes a base64url string into an ArrayBuffer.
 */
export function decode(base64urlString: string): ArrayBuffer {
  const base64 = base64urlString.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64.padEnd(base64.length + padLength, '=');
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
}
