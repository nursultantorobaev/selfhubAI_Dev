# ⚡ Quick Launch Guide - 15 Minutes

Fast-track guide to get SelfHub AI live in production.

---

## 🎯 Quick Steps

### 1. Set Up Sentry (3 min)

1. Go to [sentry.io](https://sentry.io) → Sign up
2. Create React project → Copy DSN
3. Add to `.env`:
   ```env
   VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   ```

### 2. Set Up Google Analytics (3 min)

1. Go to [analytics.google.com](https://analytics.google.com) → Sign in
2. Create GA4 property → Copy Measurement ID
3. Add to `.env`:
   ```env
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

### 3. Test Locally (2 min)

```bash
npm run dev
```

- Check console for initialization messages
- Test a booking or signup
- Verify no errors

### 4. Deploy (5 min)

**Vercel (Recommended):**
```bash
npm install -g vercel
vercel login
vercel
```

**Or Netlify:**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### 5. Add Production Environment Variables (2 min)

In your deployment platform (Vercel/Netlify):
- `VITE_SUPABASE_URL` (production)
- `VITE_SUPABASE_PUBLISHABLE_KEY` (production)
- `VITE_SENTRY_DSN`
- `VITE_GA_MEASUREMENT_ID`
- `VITE_OPENAI_API_KEY` (if using)

### 6. Verify (2 min)

- [ ] Visit your live site
- [ ] Test signup/login
- [ ] Test booking
- [ ] Check Sentry dashboard
- [ ] Check GA Realtime

---

## ✅ Done!

Your app is now live! 🎉

**Next:** Monitor Sentry and GA for the first few hours.

---

**Full Guide:** See `LAUNCH_CHECKLIST.md` for detailed instructions.


