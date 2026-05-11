export async function createPKCE() {
  const arr = new Uint8Array(48);
  crypto.getRandomValues(arr);
  const verifier = Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return { verifier, challenge };
}
