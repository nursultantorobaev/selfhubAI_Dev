# Database Setup Guide

This guide will help you set up the SelfHub AI database in Supabase.

## Prerequisites

- Supabase account (free tier works)
- Access to Supabase Dashboard

## Setup Steps

### 1. Create Core Tables

Run `COMPLETE_DATABASE_SETUP.sql` in Supabase Dashboard → SQL Editor.

This creates:
- `profiles` - User profiles
- `business_profiles` - Business listings
- `services` - Business services
- `business_hours` - Operating hours
- `appointments` - Booking records
- All necessary RLS policies

### 2. Set Up Storage Buckets

Run `SETUP_STORAGE.sql` in Supabase Dashboard → SQL Editor.

This creates storage buckets for:
- Business logos (`business-logos`)
- Business cover images (`business-covers`)
- Service images (`service-images`)
- User avatars (`user-avatars`)
- All necessary RLS policies

### 3. Add Additional Features

Run these SQL scripts in order:

**3a. Fix Booking Race Condition**
- Run `FIX_BOOKING_RACE_CONDITION.sql`
- Creates safe appointment creation function

**3b. Add Cancellation Reason**
- Run `ADD_CANCELLATION_REASON.sql`
- Adds cancellation_reason column to appointments

**3c. Add Service Images**
- Run `ADD_SERVICE_IMAGE_COLUMN.sql`
- Adds image_url column to services (if not already in COMPLETE_DATABASE_SETUP.sql)

**3d. Allow Business Owners to Create Appointments**
- Run `ALLOW_BUSINESS_OWNERS_CREATE_APPOINTMENTS.sql`
- Adds RLS policy for business owners

**3e. Auto-Cancel Unconfirmed (Optional)**
- Run `AUTO_CANCEL_UNCONFIRMED.sql`
- Sets up automatic cancellation of unconfirmed appointments

### 4. Set Up Reviews (Optional)

The reviews table is created via migration: `supabase/migrations/20251027060000_create_reviews.sql`

If you need to run it manually, execute the SQL from that file.

### 5. Enable Email Notifications (Optional)

1. Set up Resend account at https://resend.com
2. Get your Resend API key
3. Deploy Edge Function (see `EMAIL_SETUP_GUIDE.md`)
4. Run `SETUP_EMAIL_NOTIFICATIONS.sql`

## File Order

Run scripts in this order:

1. `COMPLETE_DATABASE_SETUP.sql` - Core tables (includes logo_url and cover_image_url)
2. `SETUP_STORAGE.sql` - Storage buckets
3. `FIX_BOOKING_RACE_CONDITION.sql` - Safe booking function
4. `ADD_CANCELLATION_REASON.sql` - Cancellation reason column
5. `ADD_SERVICE_IMAGE_COLUMN.sql` - Service images (if not in step 1)
6. `ALLOW_BUSINESS_OWNERS_CREATE_APPOINTMENTS.sql` - Business owner permissions
7. `AUTO_CANCEL_UNCONFIRMED.sql` - Auto-cancel feature (optional)
8. `SETUP_EMAIL_NOTIFICATIONS.sql` - Email notifications (optional)

## Verification

After running all scripts, verify:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check storage buckets
SELECT * FROM storage.buckets;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## Troubleshooting

- **Permission errors**: Make sure you're running as the project owner
- **Duplicate errors**: Use `IF NOT EXISTS` or `DROP IF EXISTS` before creating
- **RLS errors**: Check that policies are created in the correct order

## Need Help?

See `README.md` for general setup instructions.

