import { useState, useEffect } from 'react';

// Module-level singleton promise to prevent duplicate requests
let locationPromise = null;

const requestLocation = () => {
  if (locationPromise) return locationPromise;

  const cached = localStorage.getItem('cached_location');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      locationPromise = Promise.resolve(parsed);
      return locationPromise;
    } catch (e) {}
  }

  if (!('geolocation' in navigator)) {
    locationPromise = Promise.reject(new Error('Geolocation not supported'));
    return locationPromise;
  }

  locationPromise = new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        localStorage.setItem('cached_location', JSON.stringify(newCoords));
        resolve(newCoords);
      },
      (err) => {
        // Reset promise on error so we can try again if needed
        locationPromise = null;
        reject(err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });

  return locationPromise;
};

export const useLocation = () => {
  const [coords, setCoords] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_location');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [status, setStatus] = useState(coords ? 'success' : 'loading');

  useEffect(() => {
    if (coords) return; // already have it

    let isMounted = true;
    requestLocation()
      .then((newCoords) => {
        if (isMounted) {
          setCoords(newCoords);
          setStatus('success');
        }
      })
      .catch(() => {
        if (isMounted) setStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, [coords]);

  return { coords, status };
};
