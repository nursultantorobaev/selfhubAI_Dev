# 🚀 Launch Checklist - SelfHub AI

Complete checklist for launching SelfHub AI to production.

---

## ✅ Pre-Launch Setup (15-20 minutes)

### Step 1: Set Up Sentry (5 minutes)

1. **Create Account**
   - Go to [https://sentry.io](https://sentry.io)
   - Click "Sign Up" (free tier available)
   - Verify your email

2. **Create Project**
   - Click "Create Project"
   - Select **React** as platform
   - Project name: `SelfHub AI`
   - Team: Choose or create
   - Click "Create Project"

3. **Get Your DSN**
   - After project creation, you'll see your DSN
   - It looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
   - **Copy this DSN** - you'll need it

4. **Add to Environment**
   - Add to your `.env` file:
     ```env
     VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
     ```
   - **For Production:** Add to your deployment platform's environment variables

---

### Step 2: Set Up Google Analytics (5 minutes)

1. **Create Account**
   - Go to [https://analytics.google.com](https://analytics.google.com)
   - Sign in with Google account
   - Click "Start measuring" or "Admin" → "Create Property"

2. **Create Property**
   - Property name: `SelfHub AI`
   - Reporting time zone: Your timezone
   - Currency: USD (or your preference)
   - Click "Next"

3. **Business Information**
   - Fill in business details
   - Click "Create"

4. **Get Measurement ID**
   - After creation, you'll see a **Measurement ID**
   - It looks like: `G-XXXXXXXXXX`
   - **Copy this ID**

5. **Add to Environment**
   - Add to your `.env` file:
     ```env
     VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
     ```
   - **For Production:** Add to your deployment platform's environment variables

---

### Step 3: Verify Setup (5 minutes)

1. **Test Locally**
   ```bash
   # Restart dev server
   npm run dev
   ```

2. **Check Console**
   - Open browser DevTools → Console
   - You should see:
     - `[Sentry] Initialized successfully` (if DSN is set)
     - No errors related to analytics

3. **Test Sentry**
   - Intentionally throw an error in a component
   - Check Sentry dashboard → Issues
   - Error should appear within seconds

4. **Test Analytics**
   - Perform actions (signup, login, booking)
   - Go to GA → Realtime → Overview
   - You should see events appearing

---

## 🚀 Deployment Steps

### Option A: Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (if not installed)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow prompts
   - Select your project
   - Add environment variables when prompted

4. **Add Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_PUBLISHABLE_KEY`
     - `VITE_SENTRY_DSN` (if using Sentry)
     - `VITE_GA_MEASUREMENT_ID` (if using GA)
     - `VITE_OPENAI_API_KEY` (if using AI features)

5. **Redeploy**
   ```bash
   vercel --prod
   ```

---

### Option B: Deploy to Netlify

1. **Install Netlify CLI** (if not installed)
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

4. **Add Environment Variables**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add all `VITE_*` variables

---

### Option C: Deploy to Other Platform

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Upload `dist/` folder** to your hosting provider

3. **Add Environment Variables** in your hosting platform

---

## ✅ Post-Deployment Checklist

### Immediate Checks (5 minutes)

- [ ] Homepage loads correctly
- [ ] All routes accessible (no 404s)
- [ ] Authentication works (signup/login)
- [ ] Business creation works
- [ ] Booking system works
- [ ] No console errors
- [ ] Mobile responsive

### Functionality Tests (10 minutes)

- [ ] Search businesses
- [ ] View business details
- [ ] Book appointment
- [ ] View bookings (customer dashboard)
- [ ] Manage bookings (business dashboard)
- [ ] Calendar view works
- [ ] Reviews system works
- [ ] Image uploads work

### Monitoring Setup (5 minutes)

- [ ] Sentry dashboard shows no errors
- [ ] Google Analytics Realtime shows visitors
- [ ] Check Sentry for any production errors
- [ ] Verify GA events are tracking

### Security Checks (5 minutes)

- [ ] HTTPS enforced
- [ ] No API keys exposed in client code
- [ ] Environment variables secured
- [ ] RLS policies working

---

## 🔧 Production Configuration

### Supabase Production Setup

1. **Create Production Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Create new project (or use existing)
   - Note: Use separate project for production

2. **Run Database Scripts**
   - Run all SQL scripts in production Supabase:
     - `COMPLETE_DATABASE_SETUP.sql`
     - `SETUP_STORAGE.sql`
     - `FIX_BOOKING_RACE_CONDITION.sql`
     - `ADD_CANCELLATION_REASON.sql`
     - `ADD_SERVICE_IMAGE_COLUMN.sql`
     - `ALLOW_BUSINESS_OWNERS_CREATE_APPOINTMENTS.sql`
     - `AUTO_CANCEL_UNCONFIRMED.sql` (optional)
     - `SETUP_EMAIL_NOTIFICATIONS.sql` (optional)

3. **Update Environment Variables**
   - Use production Supabase URL and keys
   - Never use development keys in production

---

## 📊 Post-Launch Monitoring

### First 24 Hours

- [ ] Monitor Sentry for errors
- [ ] Check GA for user activity
- [ ] Review booking activity
- [ ] Check email notifications (if enabled)
- [ ] Monitor server performance

### First Week

- [ ] Review user feedback
- [ ] Check error trends in Sentry
- [ ] Analyze user behavior in GA
- [ ] Review booking patterns
- [ ] Check for any performance issues

---

## 🆘 Troubleshooting

### Common Issues

**Issue: Sentry not working**
- Check DSN is correct
- Verify environment variable is set
- Check browser console for errors
- Ensure DSN is added to production environment

**Issue: Analytics not tracking**
- Check Measurement ID is correct
- Disable ad blockers (they block GA)
- Check GA Realtime view
- Verify script is loading (Network tab)

**Issue: Build fails**
- Check all environment variables are set
- Verify Node.js version (18+)
- Check for TypeScript errors: `npm run type-check`
- Review build logs

**Issue: Database errors**
- Verify RLS policies are set
- Check Supabase connection
- Review database logs
- Verify service role key (if using)

---

## 📝 Launch Day Checklist

### Before Launch
- [ ] All environment variables set
- [ ] Database scripts run
- [ ] Sentry account created and configured
- [ ] Google Analytics configured
- [ ] Production build tested locally
- [ ] All critical features tested

### Launch
- [ ] Deploy to production
- [ ] Verify deployment successful
- [ ] Test all critical features
- [ ] Monitor for errors

### After Launch
- [ ] Announce launch (social media, etc.)
- [ ] Monitor Sentry dashboard
- [ ] Check Google Analytics
- [ ] Gather initial feedback

---

## 🎉 You're Ready!

Once you complete the setup steps above, your application will be live and ready for users!

**Estimated Total Time:** 30-45 minutes

**Questions?** Check the documentation:
- `SENTRY_ANALYTICS_SETUP.md` - Detailed Sentry/GA setup
- `PRODUCTION_DEPLOYMENT.md` - Full deployment guide
- `TESTING_GUIDE.md` - Testing scenarios

---

**Good luck with your launch! 🚀**


