# Production Deployment Checklist

Use this checklist to ensure a smooth production deployment.

## Pre-Deployment

### Code Quality
- [ ] Run `npm run lint` - fix any errors
- [ ] Run `npm run type-check` - fix TypeScript errors
- [ ] All console.log statements removed or dev-only
- [ ] No hardcoded secrets or API keys
- [ ] Error boundaries implemented
- [ ] Loading states for all async operations

### Database
- [ ] Production Supabase project created/configured
- [ ] All SQL scripts run in correct order:
  - [ ] `COMPLETE_DATABASE_SETUP.sql`
  - [ ] `SETUP_STORAGE.sql`
  - [ ] `FIX_BOOKING_RACE_CONDITION.sql`
  - [ ] `ADD_CANCELLATION_REASON.sql`
  - [ ] `ADD_SERVICE_IMAGE_COLUMN.sql`
  - [ ] `ALLOW_BUSINESS_OWNERS_CREATE_APPOINTMENTS.sql`
  - [ ] `AUTO_CANCEL_UNCONFIRMED.sql` (optional)
  - [ ] `SETUP_EMAIL_NOTIFICATIONS.sql` (optional)
- [ ] RLS policies verified
- [ ] Storage buckets created and configured
- [ ] Edge Functions deployed (if using emails)
- [ ] Database backups enabled

### Environment Variables
- [ ] `.env.example` file created
- [ ] Production environment variables documented
- [ ] All `VITE_*` variables set in deployment platform
- [ ] No sensitive data in code
- [ ] `.env` files in `.gitignore`

### Testing
- [ ] All test scenarios from TESTING_GUIDE.md passed
- [ ] Critical user flows tested
- [ ] Edge cases tested
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive testing
- [ ] Performance testing (Lighthouse score > 90)

## Build & Deploy

### Build
- [ ] `npm run build` succeeds without errors
- [ ] `npm run preview` works locally
- [ ] Build output size reasonable (< 2MB)
- [ ] No build warnings (fix critical ones)
- [ ] Source maps disabled in production

### Deployment Platform Setup
- [ ] Platform account created (Vercel/Netlify/etc.)
- [ ] Git repository connected
- [ ] Build settings configured:
  - [ ] Build command: `npm run build`
  - [ ] Output directory: `dist`
  - [ ] Node version: 18+
- [ ] Environment variables set in platform
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active

### First Deployment
- [ ] Initial deployment successful
- [ ] Homepage loads correctly
- [ ] All routes accessible
- [ ] No 404 errors
- [ ] No console errors

## Post-Deployment Verification

### Functionality
- [ ] Authentication (sign up, sign in, sign out)
- [ ] Business profile creation
- [ ] Service management
- [ ] Business hours management
- [ ] Appointment booking
- [ ] Calendar view
- [ ] Appointment creation from calendar
- [ ] Status management
- [ ] Rescheduling
- [ ] Cancellation
- [ ] Reviews system
- [ ] Search and filters
- [ ] Image uploads
- [ ] Analytics dashboard

### Performance
- [ ] Page load time < 3 seconds
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] Lighthouse Best Practices > 90
- [ ] Lighthouse SEO > 90

### Security
- [ ] HTTPS enforced
- [ ] No mixed content warnings
- [ ] API keys not exposed
- [ ] RLS policies working
- [ ] CORS configured correctly
- [ ] Input validation working
- [ ] XSS protection active

### Monitoring Setup
- [ ] Error tracking configured (Sentry/LogRocket)
- [ ] Analytics configured (Google Analytics/Plausible)
- [ ] Uptime monitoring set up
- [ ] Performance monitoring active
- [ ] Error alerts configured

### Email (If Enabled)
- [ ] Resend account configured
- [ ] Domain verified in Resend
- [ ] Edge Function deployed
- [ ] Secrets set in Supabase
- [ ] Test email sent successfully
- [ ] Booking confirmations working
- [ ] Cancellation emails working
- [ ] Review notifications working

## Documentation

- [ ] README.md updated with production info
- [ ] TESTING_GUIDE.md complete
- [ ] PRODUCTION_DEPLOYMENT.md reviewed
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide available

## Launch Day

### Final Checks
- [ ] All critical features tested in production
- [ ] Performance metrics acceptable
- [ ] Security audit passed
- [ ] Backup strategy in place
- [ ] Rollback plan ready
- [ ] Support channels ready

### Go Live
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] Production URL accessible
- [ ] All features working
- [ ] Monitoring active
- [ ] Team notified

### Post-Launch
- [ ] Monitor error logs
- [ ] Monitor performance
- [ ] Collect user feedback
- [ ] Address critical issues immediately
- [ ] Plan improvements

---

## Quick Reference

### Build Commands
```bash
npm run build          # Production build
npm run build:prod     # Production build (explicit)
npm run preview        # Preview production build
npm run lint           # Check code quality
npm run type-check     # TypeScript validation
```

### Environment Variables
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_OPENAI_API_KEY=sk-... (optional)
```

### Deployment URLs
- Production: `https://yourdomain.com`
- Supabase: `https://your-project.supabase.co`

---

**Complete this checklist before going live!**


