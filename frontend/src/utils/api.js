/**
 * Fetch wrapper that dispatches 'auth:unauthorized' on 401 responses.
 * Listen for this event to handle token expiry (logout, redirect, toast).
 */
export async function apiFetch(url, options = {}) {
  const response = await fetch(url, options);
  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }
  return response;
}
