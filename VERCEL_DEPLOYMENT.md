# Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### Step 1: Go to Vercel
1. Visit https://vercel.com
2. Sign in with your GitHub account (or create an account)

### Step 2: Import Your Repository
1. Click **"Add New..."** → **"Project"**
2. Find and select: `nursultantorobaev/selfhubAI_Dev`
3. Click **"Import"**

### Step 3: Configure Project Settings
Vercel should auto-detect these settings, but verify:

- **Framework Preset:** `Vite` (auto-detected)
- **Root Directory:** `./` (default)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `dist` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### Step 4: Add Environment Variables ⚠️ IMPORTANT

**Before clicking "Deploy", add these environment variables:**

Click on **"Environment Variables"** section and add:

#### Required Variables (Must Have):

```
VITE_SUPABASE_URL
```
- **Value:** Your Supabase project URL
- **Where to find:** Supabase Dashboard → Settings → API → Project URL
- **Example:** `https://xxxxxxxxxxxxx.supabase.co`

```
VITE_SUPABASE_PUBLISHABLE_KEY
```
- **Value:** Your Supabase anon/public key
- **Where to find:** Supabase Dashboard → Settings → API → Project API keys → `anon` `public`
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### Optional Variables (Recommended):

```
VITE_SENTRY_DSN
```
- **Value:** Your Sentry DSN (for error tracking)
- **Where to find:** Sentry Dashboard → Settings → Projects → Your Project → Client Keys (DSN)
- **Example:** `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
- **Note:** App will work without this, but errors won't be tracked

```
VITE_GA_MEASUREMENT_ID
```
- **Value:** Your Google Analytics Measurement ID
- **Where to find:** Google Analytics → Admin → Data Streams → Your Stream → Measurement ID
- **Example:** `G-XXXXXXXXXX`
- **Note:** App will work without this, but analytics won't track

```
VITE_OPENAI_API_KEY
```
- **Value:** Your OpenAI API key (for AI business setup feature)
- **Where to find:** OpenAI Dashboard → API Keys
- **Example:** `sk-...`
- **Note:** App will work without this, but AI business setup won't be available

### Step 5: Deploy!

1. Click **"Deploy"** button
2. Wait for the build to complete (usually 1-3 minutes)
3. Your app will be live at: `https://your-project-name.vercel.app`

---

## 📋 Post-Deployment Checklist

After deployment:

- [ ] Visit your live site
- [ ] Test user signup/login
- [ ] Test business creation
- [ ] Test appointment booking
- [ ] Verify images upload correctly
- [ ] Check browser console for errors
- [ ] Test on mobile device

---

## 🔧 Troubleshooting

### Build Fails

**Error: "Module not found"**
- Make sure all dependencies are in `package.json`
- Check that `node_modules` is not committed (it's in `.gitignore`)

**Error: "Environment variable not found"**
- Verify all required environment variables are set in Vercel
- Make sure variable names start with `VITE_` (required for Vite)

### App Works Locally But Not on Vercel

1. Check Vercel build logs for errors
2. Verify environment variables are set correctly
3. Check that Supabase URL and keys are correct
4. Ensure Supabase project allows requests from your Vercel domain

### Images Not Loading

1. Check Supabase Storage bucket permissions
2. Verify RLS policies allow public read access
3. Check CORS settings in Supabase

---

## 🔄 Updating Your Deployment

After pushing changes to GitHub:

1. Vercel automatically detects new commits
2. New deployment is triggered automatically
3. Preview deployments are created for each push
4. Production deployment happens when you merge to `main`

You can also manually trigger deployments from Vercel dashboard.

---

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ Yes | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ Yes | Supabase anon/public key |
| `VITE_SENTRY_DSN` | ❌ No | Sentry error tracking DSN |
| `VITE_GA_MEASUREMENT_ID` | ❌ No | Google Analytics Measurement ID |
| `VITE_OPENAI_API_KEY` | ❌ No | OpenAI API key for AI features |

---

## 🎉 Success!

Once deployed, your app will be live and accessible to users worldwide!

**Next Steps:**
- Set up custom domain (optional) in Vercel settings
- Monitor errors in Sentry (if configured)
- Track analytics in Google Analytics (if configured)
- Share your live URL with users!

---

**Last Updated:** January 2025

