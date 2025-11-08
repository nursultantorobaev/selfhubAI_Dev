# Fix Google Maps API Error: ApiNotActivatedMapError

## The Problem
You're seeing: `Google Maps JavaScript API error: ApiNotActivatedMapError`

This means your API key exists, but the **Places API** is not enabled for it.

## Solution: Enable Required APIs

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Select your project (or create a new one)

### Step 2: Enable Required APIs
You need to enable **TWO** APIs:

1. **Places API (New)**
   - Go to: APIs & Services → Library
   - Search for: "Places API (New)"
   - Click "Enable"

2. **Geocoding API** (for converting addresses to coordinates)
   - Search for: "Geocoding API"
   - Click "Enable"

### Step 3: Verify Your API Key
1. Go to: APIs & Services → Credentials
2. Find your API key
3. Click on it to edit
4. Under "API restrictions":
   - Select "Restrict key"
   - Check: "Places API (New)" and "Geocoding API"
   - OR select "Don't restrict key" (for testing only)

### Step 4: Add Domain Restrictions (Recommended for Production)
1. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domains:
     - `localhost:*` (for development)
     - `*.vercel.app` (for Vercel deployments)
     - `yourdomain.com/*` (your production domain)

### Step 5: Save and Wait
- Click "Save"
- Wait 1-2 minutes for changes to propagate
- Refresh your app

## Quick Checklist
- [ ] Places API (New) is enabled
- [ ] Geocoding API is enabled
- [ ] API key has these APIs in restrictions (or no restrictions)
- [ ] Domain restrictions are set (if using restrictions)
- [ ] Waited 1-2 minutes after saving

## Alternative: Use Places API (Legacy)
If you prefer the legacy API:
1. Enable "Places API" (without "New")
2. Update the code to use the legacy version

## Still Not Working?
1. Check browser console for other errors
2. Verify API key is correct in `.env` file
3. Make sure you're using the same project in Google Cloud Console
4. Check billing is enabled (even for free tier)

