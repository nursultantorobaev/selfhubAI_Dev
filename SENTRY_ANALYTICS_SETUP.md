# Sentry & Analytics Setup Guide

Complete guide for setting up error tracking (Sentry) and analytics (Google Analytics) for SelfHub AI.

---

## 📦 Step 1: Install Dependencies

```bash
npm install @sentry/react
```

**Note:** Google Analytics doesn't require a package - it's loaded via script tag.

---

## 🔴 Step 2: Set Up Sentry

### 2.1 Create Sentry Account

1. Go to [https://sentry.io](https://sentry.io)
2. Sign up for a free account (or log in)
3. Create a new project:
   - Select **React** as the platform
   - Project name: `SelfHub AI`
   - Team: Choose or create a team

### 2.2 Get Your DSN

1. After creating the project, Sentry will show you a **DSN** (Data Source Name)
2. It looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
3. Copy this DSN - you'll need it for the environment variable

### 2.3 Configure Environment Variable

Add to your `.env` file:

```env
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

**For production:** Add this to your deployment platform's environment variables:
- **Vercel:** Project Settings → Environment Variables
- **Netlify:** Site Settings → Environment Variables

---

## 📊 Step 3: Set Up Google Analytics

### 3.1 Create Google Analytics Account

1. Go to [https://analytics.google.com](https://analytics.google.com)
2. Sign in with your Google account
3. Click **"Start measuring"** or **"Admin"** → **"Create Property"**
4. Fill in:
   - Property name: `SelfHub AI`
   - Reporting time zone: Your timezone
   - Currency: USD (or your preference)
5. Click **"Next"** and fill in business information
6. Click **"Create"**

### 3.2 Get Your Measurement ID

1. After creating the property, you'll see a **Measurement ID**
2. It looks like: `G-XXXXXXXXXX`
3. Copy this ID - you'll need it for the environment variable

### 3.3 Configure Environment Variable

Add to your `.env` file:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**For production:** Add this to your deployment platform's environment variables.

---

## ✅ Step 4: Verify Installation

### 4.1 Test Sentry

1. Start your dev server: `npm run dev`
2. Open browser console
3. You should see: `[Sentry] Not initialized - VITE_SENTRY_DSN not set. This is normal in development.`
4. Add `VITE_SENTRY_DSN` to `.env` and restart
5. You should see: `[Sentry] Initialized successfully`
6. To test error tracking, intentionally throw an error in a component

### 4.2 Test Google Analytics

1. Add `VITE_GA_MEASUREMENT_ID` to `.env`
2. Restart dev server
3. Open your app in the browser
4. Go to Google Analytics → Realtime → Overview
5. You should see your visit appear within a few seconds

---

## 🎯 Step 5: Track Key Events

The analytics utility (`src/lib/analytics.ts`) provides functions for tracking events:

### Available Tracking Functions

```typescript
// User actions
trackSignUp("email");
trackLogin("email");

// Booking actions
trackBooking({
  business_id: "123",
  service_id: "456",
  value: 50.00,
  currency: "USD"
});

trackCancellation({ business_id: "123", appointment_id: "789" });
trackReschedule({ business_id: "123", appointment_id: "789" });

// Reviews
trackReview({ business_id: "123", rating: 5 });

// Search
trackSearch("haircut", { category: "barbershop" });

// Business views
trackBusinessView("123", "Hair Salon");
trackServiceView("456", "Haircut");

// Business creation
trackBusinessCreation("manual"); // or "ai"
```

### Where Events Are Tracked

Events are automatically tracked in:
- ✅ Error Boundary (errors)
- ⏳ AuthDialog (signup/login) - **TODO: Add tracking**
- ⏳ BookingDialog (bookings) - **TODO: Add tracking**
- ⏳ ReviewForm (reviews) - **TODO: Add tracking**

**Note:** You can add tracking to other components as needed.

---

## 🔧 Configuration Options

### Sentry Configuration

The Sentry configuration is in `src/lib/sentry.ts`. Key settings:

- **tracesSampleRate:** 10% in production (1.0 in dev)
- **replaysSessionSampleRate:** 10% of sessions
- **replaysOnErrorSampleRate:** 100% of error sessions
- **beforeSend:** Filters sensitive data

### Google Analytics Configuration

The GA4 configuration is in `src/lib/analytics.ts`. It automatically:
- Tracks page views
- Tracks custom events
- Includes page path and title

---

## 📈 Viewing Data

### Sentry Dashboard

1. Go to [https://sentry.io](https://sentry.io)
2. Select your project
3. View:
   - **Issues:** All errors and exceptions
   - **Performance:** Page load times and API calls
   - **Replays:** Session recordings (for errors)

### Google Analytics Dashboard

1. Go to [https://analytics.google.com](https://analytics.google.com)
2. Select your property
3. View:
   - **Realtime:** Current users and events
   - **Reports:** User behavior, conversions, etc.
   - **Events:** Custom events you're tracking

---

## 🚨 Troubleshooting

### Sentry Not Working

1. **Check DSN:** Verify `VITE_SENTRY_DSN` is set correctly
2. **Check Console:** Look for Sentry initialization messages
3. **Check Network:** Ensure requests to `sentry.io` aren't blocked
4. **Check Environment:** Sentry only sends in production (or when DSN is set)

### Google Analytics Not Working

1. **Check Measurement ID:** Verify `VITE_GA_MEASUREMENT_ID` is set correctly
2. **Check Console:** Open browser DevTools → Network tab, look for requests to `google-analytics.com`
3. **Check Ad Blockers:** Disable ad blockers (they block GA)
4. **Check Realtime:** Use GA Realtime view to see if events are coming through

### Events Not Showing

1. **Wait a few minutes:** GA can take 24-48 hours for some reports
2. **Check Realtime:** Use Realtime view for immediate feedback
3. **Verify function calls:** Ensure tracking functions are being called
4. **Check browser console:** Look for errors

---

## 🔒 Privacy & Compliance

### GDPR Compliance

- **Sentry:** Processes error data. Review their [Privacy Policy](https://sentry.io/privacy/)
- **Google Analytics:** Tracks user behavior. Consider:
  - Adding cookie consent banner
  - Configuring GA4 for GDPR compliance
  - Using GA4's IP anonymization

### Data Retention

- **Sentry:** 90 days on free tier
- **Google Analytics:** Configurable (default: 14 months)

---

## 📝 Environment Variables Summary

Add these to your `.env` file:

```env
# Sentry Error Tracking (Optional but recommended)
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Google Analytics (Optional but recommended)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**For Production:**
- Add these to your deployment platform's environment variables
- Never commit `.env` files to git (already in `.gitignore`)

---

## ✅ Checklist

- [ ] Sentry account created
- [ ] Sentry DSN added to `.env`
- [ ] Google Analytics property created
- [ ] GA Measurement ID added to `.env`
- [ ] Sentry initialization verified (check console)
- [ ] Google Analytics verified (check Realtime)
- [ ] Test error tracking (intentionally throw error)
- [ ] Test event tracking (perform actions, check GA)
- [ ] Production environment variables set

---

## 🎉 You're Done!

Once both are set up, you'll have:
- ✅ Real-time error tracking and monitoring
- ✅ User behavior analytics
- ✅ Performance insights
- ✅ Conversion tracking

**Next Steps:**
1. Monitor Sentry for errors
2. Set up alerts in Sentry for critical errors
3. Create custom reports in Google Analytics
4. Set up conversion goals in GA4

---

**Last Updated:** January 2025


