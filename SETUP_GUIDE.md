# SelfHub AI - Complete Setup Guide

This guide will help you set up and run the SelfHub AI project from scratch.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Environment Setup](#environment-setup)
4. [Database Setup (Supabase)](#database-setup-supabase)
5. [Installation](#installation)
6. [Running the Project](#running-the-project)
7. [Project Structure](#project-structure)
8. [Key Features](#key-features)
9. [Troubleshooting](#troubleshooting)
10. [Deployment](#deployment)

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **bun**
- **Git** - [Download](https://git-scm.com/)
- **Supabase Account** - [Sign up](https://supabase.com/) (free tier available)
- **Google Cloud Account** (optional, for address autocomplete) - [Sign up](https://cloud.google.com/)

---

## Project Overview

SelfHub AI is a beauty and wellness booking platform that connects customers with service providers. It features:

- **Customer Features**: Browse businesses, book appointments, manage bookings, leave reviews
- **Business Features**: Manage profile, services, hours, appointments, analytics
- **AI-Powered**: AI-assisted business setup and onboarding
- **Guest Booking**: Customers can book without creating an account
- **Map View**: Location-based business search with interactive maps
- **Role-Based Access**: Separate workflows for customers and business owners

**Tech Stack:**
- Frontend: React 18 + TypeScript + Vite
- UI: Tailwind CSS + shadcn/ui components
- Backend: Supabase (PostgreSQL + Auth + Storage)
- Maps: Leaflet + Google Places API
- State Management: React Query (TanStack Query)
- Forms: React Hook Form + Zod validation

---

## Environment Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/nursultantorobaev/selfhubAI_Dev.git
cd selfhubAI_Dev
```

### Step 2: Install Dependencies

```bash
npm install
# or
bun install
```

### Step 3: Create Environment File

Create a `.env` file in the root directory:

```bash
cp .env.example .env  # If you have an example file
# Or create .env manually
```

### Step 4: Configure Environment Variables

Add the following to your `.env` file:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Google Maps API (OPTIONAL - for address autocomplete)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Sentry (OPTIONAL - for error tracking)
VITE_SENTRY_DSN=your_sentry_dsn

# Google Analytics (OPTIONAL)
VITE_GA_MEASUREMENT_ID=your_ga_measurement_id

# OpenAI API (OPTIONAL - for AI business setup)
VITE_OPENAI_API_KEY=your_openai_api_key
```

**Where to find these values:**
- **Supabase**: Dashboard → Settings → API
- **Google Maps**: [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
- **Sentry**: [Sentry Dashboard](https://sentry.io/)
- **Google Analytics**: [Google Analytics](https://analytics.google.com/)
- **OpenAI**: [OpenAI Platform](https://platform.openai.com/)

---

## Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Fill in project details:
   - Name: `selfhub-ai` (or your preferred name)
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to be created (2-3 minutes)

### Step 2: Run Database Migrations

1. Open Supabase Dashboard → SQL Editor
2. Run migrations in this order:

   **a) Complete Database Setup:**
   ```sql
   -- Copy and paste contents of: COMPLETE_DATABASE_SETUP.sql
   ```
   This creates all tables, RLS policies, and functions.

   **b) Additional Migrations (if needed):**
   ```sql
   -- Guest Booking Support
   -- Copy contents of: ENABLE_GUEST_BOOKING.sql
   
   -- Location Coordinates (for map view)
   -- Copy contents of: ADD_LOCATION_COORDINATES.sql
   
   -- Onboarding Tracking
   -- Copy contents of: ADD_ONBOARDING_TRACKING.sql
   ```

3. Verify tables were created:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
   
   You should see:
   - `profiles`
   - `business_profiles`
   - `services`
   - `business_hours`
   - `appointments`
   - `reviews`

### Step 3: Set Up Storage Buckets

1. Go to Supabase Dashboard → Storage
2. Run the storage setup script:
   ```sql
   -- Copy and paste contents of: SETUP_STORAGE.sql
   ```
   
   This creates buckets for:
   - Business logos
   - Business cover images
   - User avatars
   - Service images

### Step 4: Configure Authentication

1. Go to Supabase Dashboard → Authentication → Settings
2. Configure:
   - **Site URL**: `http://localhost:8080` (for development)
   - **Redirect URLs**: Add:
     - `http://localhost:8080/**`
     - `https://your-production-domain.com/**`
   - **Email Templates**: Customize if needed (optional)
   - **Email Confirmations**: Enable/disable based on your needs

### Step 5: Create Test Data (Optional)

To populate the database with sample businesses:

1. Create test user accounts (sign up 7 accounts in the app)
2. Get their user IDs:
   ```sql
   SELECT id, email FROM auth.users;
   ```
3. Update `CREATE_TEST_DATA.sql` with real user IDs
4. Run the script in SQL Editor

---

## Installation

### Install Node Dependencies

```bash
npm install
```

This will install all required packages including:
- React and React DOM
- Supabase client
- React Router
- React Query
- Form libraries
- UI components
- And more...

### Verify Installation

```bash
npm run type-check  # Check TypeScript types
npm run lint         # Check code quality
```

---

## Running the Project

### Development Mode

```bash
npm run dev
```

The app will start at: **http://localhost:8080**

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## Project Structure

```
sefhubai-main/
├── public/                 # Static assets
│   ├── favicon.svg        # App favicon
│   └── robots.txt         # SEO robots file
│
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── Header.tsx     # Main navigation
│   │   ├── Footer.tsx    # Footer component
│   │   ├── AuthDialog.tsx # Login/Signup
│   │   ├── BookingDialog.tsx # Booking form
│   │   └── ...
│   │
│   ├── pages/            # Page components
│   │   ├── Index.tsx     # Home/Landing page
│   │   ├── Dashboard.tsx # Business dashboard
│   │   ├── CustomerHome.tsx # Customer home
│   │   └── ...
│   │
│   ├── hooks/            # Custom React hooks
│   │   ├── useBusinesses.ts
│   │   ├── useAppointments.ts
│   │   └── ...
│   │
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx # Authentication
│   │
│   ├── lib/              # Utility functions
│   │   ├── utils.ts      # Helper functions
│   │   ├── validation.ts # Form validation
│   │   ├── aiService.ts  # AI integration
│   │   └── ...
│   │
│   ├── integrations/     # External integrations
│   │   └── supabase/    # Supabase client & types
│   │
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
│
├── supabase/
│   ├── migrations/       # Database migrations
│   └── functions/       # Edge functions
│
├── *.sql                 # SQL setup scripts
├── package.json          # Dependencies
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind configuration
└── tsconfig.json         # TypeScript configuration
```

---

## Key Features

### 1. Authentication & Authorization
- Email/password authentication via Supabase
- Role-based access (Customer vs Business Owner)
- Protected routes
- Email verification (configurable)

### 2. Business Management
- Create/update business profiles
- Manage services (add, edit, delete)
- Set business hours
- Upload logos and cover images
- View analytics and bookings

### 3. Customer Features
- Browse businesses with filters
- Map view with location search
- Book appointments (with or without account)
- Manage bookings
- Leave reviews and ratings

### 4. AI Features
- AI-powered business setup
- Auto-generate services and hours from description

### 5. Form Improvements
- State dropdown (all 50 US states)
- Phone number auto-formatting
- City autocomplete (200+ US cities)
- Address autocomplete (Google Places)

---

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Supabase connection errors

**Check:**
1. Environment variables are set correctly
2. Supabase project is active
3. API keys are correct
4. Network allows connections to Supabase

### Issue: Google Maps not working

**Check:**
1. `VITE_GOOGLE_MAPS_API_KEY` is set
2. Places API is enabled in Google Cloud Console
3. API key restrictions allow your domain
4. See `FIX_GOOGLE_MAPS_API_ERROR.md` for details

### Issue: Database errors

**Check:**
1. All migrations have been run
2. RLS policies are set correctly
3. User has proper permissions
4. Check Supabase logs: Dashboard → Logs

### Issue: Build fails

**Check:**
1. TypeScript errors: `npm run type-check`
2. Linting errors: `npm run lint`
3. Missing dependencies: `npm install`

### Issue: Port already in use

**Solution:**
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Or change port in vite.config.ts
```

---

## Deployment

### Vercel (Recommended)

1. **Connect Repository:**
   - Go to [Vercel Dashboard](https://vercel.com/)
   - Import your GitHub repository

2. **Configure Build:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Add Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env` file
   - Make sure to add for Production, Preview, and Development

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live!

### Other Platforms

The project can be deployed to:
- **Netlify**: Similar to Vercel
- **AWS Amplify**: Supports Vite
- **Cloudflare Pages**: Free and fast
- **Any static host**: Build locally and upload `dist/` folder

---

## Development Workflow

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Test locally:
   ```bash
   npm run dev
   ```

4. Check for errors:
   ```bash
   npm run type-check
   npm run lint
   ```

5. Commit and push:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

### Database Changes

1. Create migration SQL file
2. Test in Supabase SQL Editor
3. Add to repository
4. Document in migration file

---

## Important Files Reference

| File | Purpose |
|------|---------|
| `COMPLETE_DATABASE_SETUP.sql` | Main database setup script |
| `CREATE_TEST_DATA.sql` | Sample businesses for testing |
| `ENABLE_GUEST_BOOKING.sql` | Enable guest booking feature |
| `ADD_LOCATION_COORDINATES.sql` | Add lat/lng for map view |
| `SETUP_STORAGE.sql` | Configure image storage buckets |
| `FIX_GOOGLE_MAPS_API_ERROR.md` | Troubleshooting Google Maps |
| `GOOGLE_PLACES_SETUP.md` | Google Places API setup |

---

## Getting Help

- **Documentation**: Check the `.md` files in the project root
- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev

---

## Next Steps

1. ✅ Set up environment variables
2. ✅ Run database migrations
3. ✅ Start development server
4. ✅ Create test accounts
5. ✅ Add test data (optional)
6. ✅ Start developing!

---

**Questions?** Check the troubleshooting section or review the SQL files for database setup details.

