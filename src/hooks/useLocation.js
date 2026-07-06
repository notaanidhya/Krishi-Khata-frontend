import { useState, useEffect, useRef } from 'react';

// ── One-time migration: clear old cache formats ──────────────────
// Old cached_location had no `cachedAt` field, meaning it never expired.
// Old `location_asked` flag permanently blocked GPS re-prompting.
// We clear both once (guarded by a migration flag) so users get a fresh GPS read.
(() => {
  try {
    if (!localStorage.getItem('_loc_migrated_v2')) {
      localStorage.removeItem('cached_location');
      localStorage.removeItem('location_asked');
      localStorage.setItem('_loc_migrated_v2', '1');
    }
  } catch { /* ignore */ }
})();

// Location cache TTL: 30 minutes.
// After this, we always try to get a fresh GPS fix in the background.
const LOCATION_TTL_MS = 1000 * 60 * 30;
const LOCATION_CACHE_KEY = 'cached_location';

/**
 * Read cached location from localStorage.
 * Returns the coords if they exist AND are fresh (< 30 min old), else null.
 */
const readCache = () => {
  try {
    const raw = localStorage.getItem(LOCATION_CACHE_KEY);
    if (!raw) return null;
    const { lat, lon, cachedAt } = JSON.parse(raw);
    if (!lat || !lon) return null;
    if (Date.now() - (cachedAt || 0) > LOCATION_TTL_MS) return null;
    return { lat, lon };
  } catch {
    return null;
  }
};

/**
 * Write coords to localStorage with a fresh timestamp.
 */
const writeCache = (lat, lon) => {
  try {
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({ lat, lon, cachedAt: Date.now() }));
  } catch { /* localStorage full — silently ignore */ }
};

/**
 * useLocation — single source of truth for GPS coordinates.
 *
 * Behaviour:
 * - On first render: instantly returns a fresh cached value if < 30 min old.
 * - Always triggers a background GPS refresh regardless of cache:
 *     • If GPS succeeds → updates coords + refreshes cache timestamp.
 *     • If GPS fails    → keeps serving whatever cached value we have.
 * - Never permanently blocks re-prompting with the `location_asked` flag.
 * - `status` is 'loading' | 'success' | 'error'.
 */
export const useLocation = () => {
  const [coords, setCoords] = useState(() => readCache());
  const [status, setStatus] = useState(() => (readCache() ? 'success' : 'loading'));
  const hasFetched = useRef(false);

  useEffect(() => {
    // Prevent double-firing in React Strict Mode
    if (hasFetched.current) return;
    hasFetched.current = true;

    if (!('geolocation' in navigator)) {
      setStatus('error');
      return;
    }

    const onSuccess = (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;
      writeCache(lat, lon);
      setCoords({ lat, lon });
      setStatus('success');
    };

    const onError = (err) => {
      console.warn('[useLocation] GPS error:', err.message);
      // Don't wipe existing coords — keep serving the last known good location.
      // Only mark as error if we have nothing at all.
      setStatus((prev) => (prev === 'success' ? 'success' : 'error'));
    };

    const requestGPS = (highAccuracy = true) => {
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        (err) => {
          // If high accuracy times out (very common on Windows desktops), fall back to standard accuracy
          if (highAccuracy && (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE)) {
            console.warn('[useLocation] High accuracy GPS failed, falling back to standard accuracy...');
            requestGPS(false);
          } else {
            onError(err);
          }
        },
        { enableHighAccuracy: highAccuracy, timeout: highAccuracy ? 8000 : 15000, maximumAge: 0 }
      );
    };

    // Use Permissions API if available to avoid unnecessary prompts
    if (navigator.permissions?.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted' || result.state === 'prompt') {
          // 'prompt' will show the browser dialog — that's intentional.
          // We never permanently suppress it via a localStorage flag.
          requestGPS();
        } else {
          // 'denied' — can't do anything, keep existing cache or mark error
          setStatus((prev) => (prev === 'success' ? 'success' : 'error'));
        }
      }).catch(requestGPS); // fallback if permissions API itself fails
    } else {
      requestGPS();
    }
  }, []); // Run once on mount

  return { coords, status };
};
