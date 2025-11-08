# SelfHub AI - Beauty & Wellness Booking Platform

A modern, full-featured booking platform for beauty and wellness businesses built with React, TypeScript, and Supabase.

## Features

### For Customers
- 🔍 **Search & Discover** - Find beauty and wellness businesses by type, location, and name
- 📅 **Easy Booking** - Book appointments with intuitive time slot selection
- 📱 **Customer Dashboard** - View upcoming and past appointments, cancel bookings
- ⭐ **Reviews & Ratings** - Leave reviews for completed appointments
- 🖼️ **Visual Experience** - Browse businesses with images and ratings

### For Business Owners
- 🤖 **AI Business Setup** - Set up your business in one prompt using AI (OpenAI required)
- 🏢 **Business Profile** - Create and manage your business profile with logo and cover images
- 💼 **Services Management** - Add, edit, and manage services with images
- ⏰ **Business Hours** - Set operating hours for each day of the week
- 📊 **Booking Management** - View and manage all appointments
- 📧 **Email Notifications** - Automatic email notifications for bookings and reviews
- ⭐ **Review Management** - See and respond to customer reviews

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd sefhubai-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key  # Optional, for AI features
   ```

4. **Set up Supabase Database**
   See `DATABASE_SETUP.md` for detailed instructions.
   
   Quick setup:
   - Go to your Supabase Dashboard → SQL Editor
   - Run `COMPLETE_DATABASE_SETUP.sql` to create all tables and policies
   - Run `SETUP_STORAGE.sql` to set up image storage buckets
   - Run `FIX_BOOKING_RACE_CONDITION.sql` for safe bookings
   - Run `ADD_CANCELLATION_REASON.sql` for cancellation tracking
   - Run `ADD_SERVICE_IMAGE_COLUMN.sql` to add image column to services
   - Run `ALLOW_BUSINESS_OWNERS_CREATE_APPOINTMENTS.sql` for calendar feature
   - Run `AUTO_CANCEL_UNCONFIRMED.sql` (optional) for auto-cancellation
   - See `DATABASE_SETUP.md` for detailed instructions

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:8080` (or the port shown in terminal)

## Database Setup

See `DATABASE_SETUP.md` for complete setup instructions.

Run these SQL scripts in order in your Supabase Dashboard:

1. `COMPLETE_DATABASE_SETUP.sql` - Creates all core tables (includes logo_url and cover_image_url)
2. `SETUP_STORAGE.sql` - Sets up storage buckets for images
3. `FIX_BOOKING_RACE_CONDITION.sql` - Safe booking function
4. `ADD_CANCELLATION_REASON.sql` - Adds cancellation_reason column
5. `ADD_SERVICE_IMAGE_COLUMN.sql` - Adds image_url to services
6. `ALLOW_BUSINESS_OWNERS_CREATE_APPOINTMENTS.sql` - Business owner permissions
7. `AUTO_CANCEL_UNCONFIRMED.sql` - Auto-cancel feature (optional)
8. Reviews table is created via migration: `supabase/migrations/20251027060000_create_reviews.sql`

See `DATABASE_SETUP.md` for detailed setup instructions.

## AI Features (Optional)

Enable AI-powered business setup:

1. **Get OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key (starts with `sk-...`)

2. **Add to Environment**
   - Add to `.env`: `VITE_OPENAI_API_KEY=sk-your-key-here`
   - Restart dev server

3. **Use AI Setup**
   - Go to Dashboard (when no business exists)
   - Click "AI Quick Setup" button
   - Describe your business in natural language
   - AI generates business details, services, and hours
   - Review and submit

**Note:** AI features require credits in your OpenAI account. Free tier may have usage limits.

## Email Notifications (Optional)

To enable email notifications:

1. **Set Up Resend Account**
   - Sign up at https://resend.com (free tier available)
   - Get your API key from dashboard
   - Verify a domain (or use `onboarding@resend.dev` for testing)

2. **Deploy Edge Function**
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref zpdemgegypfodgmgpvoz
   
   # Set Resend API key as secret
   supabase secrets set RESEND_API_KEY=re_your_api_key_here
   supabase secrets set RESEND_FROM_EMAIL=onboarding@resend.dev
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Deploy function
   supabase functions deploy send-email
   ```

3. **Run SQL Script**
   - Run `SETUP_EMAIL_NOTIFICATIONS.sql` in Supabase SQL Editor
   - This creates database functions and triggers for email notifications

**Email Types:**
- Booking confirmations
- Booking reminders (24h before)
- Booking cancellations
- Rescheduling notifications
- Review notifications

## Project Structure

```
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   └── ...          # Feature components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── contexts/        # React contexts
│   ├── lib/             # Utility functions
│   └── integrations/    # Supabase integration
├── supabase/
│   ├── functions/       # Edge Functions
│   └── migrations/      # Database migrations
└── public/              # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Breakdown

### Authentication
- Email/password authentication via Supabase Auth
- Automatic profile creation on signup
- Protected routes

### Business Management
- AI-powered business setup (one prompt)
- Create and edit business profiles
- Upload logo and cover images
- Set business hours
- Manage services with images and pricing

### Booking System
- Time slot selection based on business hours
- Prevents double bookings
- Booking validation
- Status management (pending, confirmed, completed, cancelled)

### Reviews & Ratings
- 5-star rating system
- Written reviews
- Average rating calculation
- Review display on business pages

### Image Management
- Business logos and cover images
- Service images
- Secure upload via Supabase Storage
- Automatic image optimization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

See LICENSE file for details.

## Testing

See `TESTING_GUIDE.md` for comprehensive testing scenarios covering all features, user flows, edge cases, and testing checklist.

## Production Deployment

Ready to deploy? See `PRODUCTION_DEPLOYMENT.md` for complete deployment instructions.

**Quick Start:**
1. Review `DEPLOYMENT_CHECKLIST.md` before deploying
2. Set up production environment variables (see `.env.example`)
3. Run all SQL scripts in production Supabase project
4. Build: `npm run build`
5. Deploy to Vercel, Netlify, or your preferred platform

**Recommended Platforms:**
- **Vercel** (recommended) - See `PRODUCTION_DEPLOYMENT.md` for Vercel setup
- **Netlify** - See `PRODUCTION_DEPLOYMENT.md` for Netlify setup
- **Traditional Hosting** - Upload `dist/` folder to your web server

See `PRODUCTION_DEPLOYMENT.md` for detailed instructions.

## Security Notes

⚠️ **Important Security Practices:**
- Never commit `.env` file to git (already in `.gitignore`)
- Regenerate API keys if exposed
- Use environment variables for all secrets
- Regularly rotate API keys
- Monitor API usage for unexpected activity

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using React, TypeScript, and Supabase
