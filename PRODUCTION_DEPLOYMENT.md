# Production Deployment Guide

Complete guide for deploying SelfHub AI to production.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Build Optimization](#build-optimization)
5. [Deployment Platforms](#deployment-platforms)
6. [Post-Deployment](#post-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

### ✅ Code Review
- [ ] All console.log statements removed (or dev-only)
- [ ] Error handling implemented
- [ ] No hardcoded API keys or secrets
- [ ] All environment variables configured
- [ ] Code follows best practices
- [ ] No TODO comments left in code

### ✅ Database Setup
- [ ] All SQL scripts run in Supabase
- [ ] RLS policies verified
- [ ] Storage buckets configured
- [ ] Edge Functions deployed (if using emails)
- [ ] Database backups enabled

### ✅ Security
- [ ] Environment variables secured
- [ ] API keys rotated (if exposed)
- [ ] CORS configured correctly
- [ ] RLS policies tested
- [ ] Storage bucket permissions verified

### ✅ Testing
- [ ] All test scenarios from TESTING_GUIDE.md passed
- [ ] Edge cases tested
- [ ] Performance tested
- [ ] Cross-browser tested
- [ ] Mobile responsive tested

---

## Environment Setup

### 1. Create Production Environment File

Create `.env.production` file:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# OpenAI (Optional - for AI features)
VITE_OPENAI_API_KEY=sk-your-openai-key-here

# Environment
NODE_ENV=production
```

### 2. Environment Variables for Different Platforms

#### Vercel
1. Go to Project Settings → Environment Variables
2. Add all `VITE_*` variables
3. Set environment to "Production"
4. Redeploy

#### Netlify
1. Go to Site Settings → Environment Variables
2. Add all `VITE_*` variables
3. Set scope to "Production"
4. Redeploy

#### Traditional Hosting
- Set environment variables in your server configuration
- Or use a `.env.production` file (ensure it's not committed)

---

## Database Configuration

### Production Database Setup

1. **Use Production Supabase Project**
   - Create a new Supabase project for production
   - OR use existing project (ensure it's the production one)

2. **Run All SQL Scripts** (in order):
   ```sql
   1. COMPLETE_DATABASE_SETUP.sql
   2. SETUP_STORAGE.sql
   3. FIX_BOOKING_RACE_CONDITION.sql
   4. ADD_CANCELLATION_REASON.sql
   5. ADD_SERVICE_IMAGE_COLUMN.sql
   6. ALLOW_BUSINESS_OWNERS_CREATE_APPOINTMENTS.sql
   7. AUTO_CANCEL_UNCONFIRMED.sql
   8. SETUP_EMAIL_NOTIFICATIONS.sql (if using emails)
   ```

3. **Verify Storage Buckets**
   - Check all buckets exist:
     - `business-logos`
     - `business-covers`
     - `service-images`
     - `user-avatars`
   - Verify RLS policies are active

4. **Configure Edge Functions** (if using emails)
   - Deploy `send-email` function
   - Set secrets:
     ```bash
     supabase secrets set RESEND_API_KEY=re_your_production_key
     supabase secrets set RESEND_FROM_EMAIL=noreply@yourdomain.com
     supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     ```

### Database Security

1. **Review RLS Policies**
   - Ensure all tables have proper policies
   - Test policies with different user roles
   - Verify business owners can only access their data

2. **Enable Database Backups**
   - Go to Supabase Dashboard → Settings → Database
   - Enable daily backups
   - Configure backup retention

3. **Monitor Database Performance**
   - Set up database monitoring
   - Configure query alerts
   - Monitor connection pool usage

---

## Build Optimization

### 1. Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### 2. Build Output

After build, you'll have:
- `dist/` folder with optimized assets
- Minified JavaScript and CSS
- Optimized images
- Code splitting for better performance

### 3. Build Size Optimization

- ✅ Already using Vite (excellent tree-shaking)
- ✅ Code splitting enabled
- ✅ Lazy loading for routes
- ✅ Image optimization recommended (add image CDN if needed)

### 4. Performance Checks

Before deploying, verify:
- [ ] Build size is reasonable (< 2MB total)
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse score > 90

---

## Deployment Platforms

### Option 1: Vercel (Recommended)

**Why Vercel:**
- Excellent React support
- Automatic deployments from Git
- Edge network for fast global access
- Environment variable management
- Free tier available

**Steps:**

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Dashboard:**
   - Go to https://vercel.com
   - Import your Git repository
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`
   - Add environment variables
   - Deploy

3. **Deploy via CLI:**
   ```bash
   vercel login
   vercel --prod
   ```

4. **Configure Custom Domain** (optional):
   - Add domain in Vercel dashboard
   - Update DNS records
   - SSL automatically configured

### Option 2: Netlify

**Steps:**

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   # Build first
   npm run build
   
   # Deploy
   netlify deploy --prod --dir=dist
   ```

3. **Via Dashboard:**
   - Connect Git repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Add environment variables
   - Deploy

### Option 3: Traditional Hosting (VPS/Shared)

**Steps:**

1. **Build Locally:**
   ```bash
   npm run build
   ```

2. **Upload to Server:**
   - Upload `dist/` folder contents to web server
   - Configure web server (Nginx/Apache) to serve static files

3. **Nginx Configuration Example:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/selfhubai/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

4. **Set Up SSL:**
   ```bash
   # Using Let's Encrypt
   certbot --nginx -d yourdomain.com
   ```

### Option 4: Docker (Advanced)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and deploy:
```bash
docker build -t selfhubai .
docker run -p 80:80 selfhubai
```

---

## Post-Deployment

### 1. Verify Deployment

- [ ] Homepage loads correctly
- [ ] Authentication works
- [ ] Database connections work
- [ ] Images load correctly
- [ ] All routes accessible
- [ ] No console errors

### 2. Test Critical Features

- [ ] User sign up/sign in
- [ ] Business profile creation
- [ ] Service management
- [ ] Appointment booking
- [ ] Calendar functionality
- [ ] Email notifications (if enabled)

### 3. Configure Domain & SSL

- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] HTTPS enforced
- [ ] DNS records correct

### 4. Set Up Monitoring

**Recommended Tools:**
- **Error Tracking**: Sentry, LogRocket
- **Analytics**: Google Analytics, Plausible
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Performance**: Vercel Analytics, Lighthouse CI

---

## Monitoring & Maintenance

### 1. Error Tracking Setup

Add Sentry (optional):

```bash
npm install @sentry/react
```

Update `src/main.tsx`:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  // ... other config
});
```

### 2. Analytics Setup

Add Google Analytics (optional):

```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 3. Performance Monitoring

- Monitor Core Web Vitals
- Track page load times
- Monitor API response times
- Set up alerts for errors

### 4. Regular Maintenance

**Weekly:**
- Check error logs
- Review user feedback
- Monitor database performance

**Monthly:**
- Review and update dependencies
- Check for security updates
- Review analytics
- Optimize database queries if needed

**Quarterly:**
- Full security audit
- Performance optimization review
- Dependency updates
- Backup verification

---

## Security Checklist

### Before Launch

- [ ] All API keys in environment variables (not hardcoded)
- [ ] `.env` files in `.gitignore`
- [ ] RLS policies tested and verified
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting configured (if needed)
- [ ] Input validation on all forms
- [ ] SQL injection protection (via Supabase)
- [ ] XSS protection (React handles this)
- [ ] CSRF protection (via Supabase)

### API Security

- [ ] Supabase anon key is public (this is OK - RLS protects data)
- [ ] Service role key is server-side only (never in client)
- [ ] OpenAI API key in environment variables
- [ ] Resend API key in Supabase secrets (not client)

---

## Performance Optimization

### Already Implemented

- ✅ Code splitting (Vite does this automatically)
- ✅ Tree shaking (removes unused code)
- ✅ Minification (Vite handles this)
- ✅ Lazy loading for routes
- ✅ Image optimization (via Supabase Storage)

### Recommended Additions

1. **CDN for Images**
   - Use Supabase Storage CDN (already configured)
   - Or integrate Cloudflare/Cloudinary

2. **Caching Strategy**
   - Static assets: 1 year cache
   - HTML: No cache (or short cache with revalidation)
   - API responses: Configure in Supabase

3. **Service Worker** (Optional)
   - Add PWA support
   - Offline functionality
   - Background sync

---

## Troubleshooting

### Build Fails

**Check:**
- Node version (should be 18+)
- All dependencies installed
- Environment variables set
- No syntax errors

### Runtime Errors

**Check:**
- Browser console for errors
- Network tab for failed requests
- Supabase logs
- Environment variables correct

### Database Errors

**Check:**
- RLS policies configured
- User authenticated
- Database connection working
- SQL scripts all run

### Image Upload Fails

**Check:**
- Storage buckets exist
- RLS policies for storage
- File size limits (5MB)
- File type validation

---

## Rollback Plan

### If Deployment Fails

1. **Vercel/Netlify:**
   - Use previous deployment from dashboard
   - One-click rollback

2. **Traditional Hosting:**
   - Keep previous `dist/` folder backup
   - Restore from backup
   - Update DNS if needed

3. **Database:**
   - Use Supabase point-in-time recovery
   - Restore from backup

---

## Support & Maintenance

### Post-Launch Support

1. **Monitor Error Logs**
   - Set up error tracking
   - Review daily
   - Fix critical issues immediately

2. **User Feedback**
   - Monitor reviews/feedback
   - Address common issues
   - Plan feature improvements

3. **Updates**
   - Regular dependency updates
   - Security patches
   - Feature enhancements
   - Bug fixes

---

## Quick Deployment Checklist

### Pre-Deploy
- [ ] Code reviewed and tested
- [ ] All SQL scripts run
- [ ] Environment variables configured
- [ ] Build succeeds locally
- [ ] Preview works correctly

### Deploy
- [ ] Choose deployment platform
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Deploy application
- [ ] Verify deployment

### Post-Deploy
- [ ] Test all critical features
- [ ] Configure custom domain
- [ ] Set up SSL
- [ ] Configure monitoring
- [ ] Test email notifications
- [ ] Verify analytics

---

## Production URLs Template

After deployment, update these in your documentation:

- **Production URL**: `https://yourdomain.com`
- **API URL**: `https://your-project-id.supabase.co`
- **Dashboard**: `https://your-project-id.supabase.co/dashboard`

---

**Last Updated:** January 2025
**Version:** 1.0

---

## Need Help?

- Check `README.md` for setup instructions
- Review `TESTING_GUIDE.md` for testing scenarios
- Check `DATABASE_SETUP.md` for database configuration
- Review Supabase documentation: https://supabase.com/docs


