# 🚀 Deploy Now - Step by Step

## Quick Deployment Guide

### Step 1: Login to Vercel

Run this command (it will open your browser):
```bash
vercel login
```

**What to do:**
1. Press ENTER when prompted
2. Browser will open
3. Sign in to Vercel (or create account if needed)
4. Authorize the CLI
5. Return to terminal - it will show "Success!"

---

### Step 2: Deploy

Once logged in, run:
```bash
vercel
```

**What to expect:**
- It will ask: "Set up and deploy?" → Type `Y` and press ENTER
- It will ask: "Which scope?" → Select your account
- It will ask: "Link to existing project?" → Type `N` (for new project)
- It will ask: "What's your project's name?" → Press ENTER (uses folder name)
- It will ask: "In which directory is your code located?" → Press ENTER (uses `./`)
- It will detect Vite and configure automatically
- It will build and deploy!

**You'll get a URL like:** `https://your-app-name.vercel.app`

---

### Step 3: Add Environment Variables

After deployment:

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com](https://vercel.com)
   - Click on your project

2. **Add Environment Variables:**
   - Go to: Settings → Environment Variables
   - Add these (one by one):

   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
   VITE_SENTRY_DSN=your_sentry_dsn (if you have it)
   VITE_GA_MEASUREMENT_ID=your_ga_id (if you have it)
   VITE_OPENAI_API_KEY=your_openai_key (if using AI)
   ```

3. **Redeploy:**
   - Go to: Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

---

### Step 4: Test Your Live Site

Visit your URL: `https://your-app-name.vercel.app`

Test:
- [ ] Homepage loads
- [ ] Sign up works
- [ ] Login works
- [ ] Booking works

---

## 🎉 Done!

Your app is now live!

**Next:** Complete Google Analytics setup using your new Vercel URL.


