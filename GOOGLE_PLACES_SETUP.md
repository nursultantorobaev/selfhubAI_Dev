# Google Places API Setup

## Required for Address Autocomplete

The address autocomplete feature uses Google Places API. You need to:

1. **Get a Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable "Places API" and "Geocoding API"
   - Create credentials (API Key)
   - Restrict the API key to your domain (recommended for production)

2. **Add the API Key:**
   - Option A: Replace the placeholder key in `index.html`:
     ```html
     <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
     ```
   
   - Option B: Use environment variable (recommended):
     - Add to `.env`: `VITE_GOOGLE_MAPS_API_KEY=your_key_here`
     - Update `index.html` to load dynamically (see below)

3. **Update index.html for Environment Variable:**
   ```html
   <script>
     const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_FALLBACK_KEY';
     const script = document.createElement('script');
     script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
     script.async = true;
     script.defer = true;
     document.head.appendChild(script);
   </script>
   ```

## Cost
- Google Places API has a free tier: $200 credit/month
- After free tier: ~$0.017 per autocomplete request
- For most small apps, the free tier is sufficient

## Alternative (No API Key Required)
If you don't want to use Google Places, we can implement a simpler address validation without autocomplete.

