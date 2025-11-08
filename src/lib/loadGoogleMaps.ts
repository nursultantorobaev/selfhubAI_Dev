// Load Google Maps API dynamically
let isLoaded = false;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

export const loadGoogleMaps = (): Promise<void> => {
  if (isLoaded) {
    return Promise.resolve();
  }

  if (isLoading && loadPromise) {
    return loadPromise;
  }

  isLoading = true;
  loadPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      isLoaded = true;
      isLoading = false;
      resolve();
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn(
        'Google Maps API key not found. Address autocomplete will not work. ' +
        'Add VITE_GOOGLE_MAPS_API_KEY to your .env file.'
      );
      isLoading = false;
      resolve(); // Resolve anyway so app doesn't break
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      resolve();
    };
    
    script.onerror = () => {
      isLoading = false;
      console.error('Failed to load Google Maps API');
      reject(new Error('Failed to load Google Maps API'));
    };

    // Listen for API errors
    window.gm_authFailure = () => {
      isLoading = false;
      console.error('Google Maps API authentication failed. Check your API key.');
      reject(new Error('Google Maps API authentication failed'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google?: {
      maps: {
        places: unknown;
      };
    };
  }
}

