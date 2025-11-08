# SelfHub AI - Comprehensive Testing Guide

This guide covers all testing scenarios for the SelfHub AI platform. Use this document to systematically test all features and ensure everything works correctly.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [User Roles](#user-roles)
3. [Authentication Testing](#authentication-testing)
4. [Business Owner Testing](#business-owner-testing)
5. [Customer Testing](#customer-testing)
6. [Calendar Management Testing](#calendar-management-testing)
7. [Search & Filter Testing](#search--filter-testing)
8. [Edge Cases & Error Handling](#edge-cases--error-handling)

---

## Prerequisites

### Before Testing

1. **Database Setup**
   - Run `COMPLETE_DATABASE_SETUP.sql` in Supabase SQL Editor
   - Run `SETUP_STORAGE.sql` for image uploads
   - Run `ADD_IMAGE_COLUMNS.sql` and `ADD_SERVICE_IMAGE_COLUMN.sql`
   - Run `FIX_BOOKING_RACE_CONDITION.sql`
   - Run `ADD_CANCELLATION_REASON.sql`
   - Run `SETUP_EMAIL_NOTIFICATIONS.sql` (optional, for emails)
   - Run `ALLOW_BUSINESS_OWNERS_CREATE_APPOINTMENTS.sql`
   - Run `AUTO_CANCEL_UNCONFIRMED.sql` (optional)

2. **Environment Variables**
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon key
   - `VITE_OPENAI_API_KEY` - (Optional) For AI features

3. **Start Application**
   ```bash
   npm run dev
   ```
   Application runs on `http://localhost:8080`

---

## User Roles

### Business Owner
- Can create and manage business profile
- Can manage services and business hours
- Can view and manage appointments
- Can create appointments directly
- Can view analytics dashboard
- Can manage calendar view

### Customer
- Can search and browse businesses
- Can view business details
- Can book appointments
- Can view own bookings
- Can cancel and reschedule appointments
- Can leave reviews

---

## Authentication Testing

### Test Scenario 1: Sign Up
**Steps:**
1. Click "Log In / Sign Up" in header
2. Go to "Sign Up" tab
3. Enter email and password
4. Click "Sign Up"
5. Check email for verification link
6. Click verification link
7. Sign in with credentials

**Expected Results:**
- ✅ Account created successfully
- ✅ Verification email sent
- ✅ Can sign in after verification
- ✅ Profile automatically created

### Test Scenario 2: Sign In
**Steps:**
1. Click "Log In / Sign Up"
2. Enter email and password
3. Click "Sign In"

**Expected Results:**
- ✅ Successfully signed in
- ✅ Redirected to homepage
- ✅ User name/avatar visible in header

### Test Scenario 3: Sign Out
**Steps:**
1. Click user avatar in header
2. Click "Sign Out"

**Expected Results:**
- ✅ Successfully signed out
- ✅ Redirected to homepage
- ✅ Header shows "Log In / Sign Up" button

---

## Business Owner Testing

### Test Scenario 4: Create Business Profile
**Steps:**
1. Sign in as business owner
2. Click "List your business" or go to `/dashboard`
3. Fill in business details:
   - Business name
   - Business type (salon, barbershop, etc.)
   - Description
   - Address, City, State, ZIP
   - Phone
   - Email (optional)
   - Website (optional)
4. Click "Create Business"

**Expected Results:**
- ✅ Business profile created
- ✅ Business appears on homepage
- ✅ Can view business on homepage
- ✅ Business visible in dashboard

### Test Scenario 5: AI Business Setup (Optional)
**Prerequisites:** OpenAI API key configured

**Steps:**
1. Sign in as business owner (no existing business)
2. Go to `/dashboard`
3. Click "AI Quick Setup" button
4. Enter business description (e.g., "A modern hair salon in downtown offering haircuts, coloring, and styling")
5. Click "Generate Business Setup"
6. Wait for AI to generate details
7. Review generated:
   - Business information
   - Services list
   - Business hours
8. Click "Use This Setup"
9. Verify all data is pre-filled
10. Submit form

**Expected Results:**
- ✅ AI generates business details
- ✅ Services created automatically
- ✅ Business hours set automatically
- ✅ Business profile created successfully

### Test Scenario 6: Edit Business Profile
**Steps:**
1. Go to `/dashboard`
2. Click "Edit Business"
3. Modify any field (e.g., phone number, description)
4. Click "Update Business"

**Expected Results:**
- ✅ Changes saved successfully
- ✅ Updated information visible on homepage
- ✅ Success toast notification shown

### Test Scenario 7: Upload Business Images
**Steps:**
1. Go to `/dashboard`
2. Scroll to "Business Images" section
3. Click "Upload Logo"
4. Select an image file
5. Wait for upload
6. Click "Upload Cover Image"
7. Select an image file
8. Wait for upload

**Expected Results:**
- ✅ Logo uploaded and displayed
- ✅ Cover image uploaded and displayed
- ✅ Images visible on business detail page
- ✅ Images optimized and stored securely

### Test Scenario 8: Manage Services
**Steps:**
1. Go to `/dashboard`
2. Scroll to "Services Management"
3. Click "Add Service"
4. Fill in:
   - Service name
   - Description
   - Duration (minutes)
   - Price
   - Upload image (optional)
5. Click "Create Service"
6. Edit an existing service
7. Delete a service

**Expected Results:**
- ✅ Service created and listed
- ✅ Service visible on business detail page
- ✅ Service can be edited
- ✅ Service can be deleted
- ✅ Service image displayed if uploaded

### Test Scenario 9: Set Business Hours
**Steps:**
1. Go to `/dashboard`
2. Scroll to "Business Hours"
3. For each day:
   - Set open time
   - Set close time
   - Or mark as closed
4. Click "Save Hours"

**Expected Results:**
- ✅ Hours saved for each day
- ✅ Closed days marked correctly
- ✅ Hours used for booking availability
- ✅ Success notification shown

### Test Scenario 10: View Appointments (List View)
**Steps:**
1. Go to `/dashboard`
2. Scroll to "Bookings Management"
3. Verify appointments are listed
4. Filter by status (All, Pending, Confirmed, Completed, Cancelled)
5. Click on an appointment to view details

**Expected Results:**
- ✅ All appointments displayed
- ✅ Filtering works correctly
- ✅ Appointment details shown
- ✅ Status badges displayed with correct colors

### Test Scenario 11: View Calendar
**Steps:**
1. Go to `/calendar` or click "Calendar" in header dropdown
2. Navigate between months using arrows
3. Click "Today" button
4. Click on a date
5. Click on an appointment in calendar

**Expected Results:**
- ✅ Calendar displays correctly
- ✅ Appointments shown on correct dates
- ✅ Color-coded by status
- ✅ Can navigate months
- ✅ Today highlighted
- ✅ Clicking appointment shows details

### Test Scenario 12: Create Appointment from Calendar
**Steps:**
1. Go to `/calendar`
2. Click "Create Appointment" button OR click on a date
3. Fill in form:
   - Select service
   - Select date (pre-filled if clicked date)
   - Select time
   - Customer name
   - Customer email
   - Phone (optional)
   - Notes (optional)
4. Click "Create Appointment"

**Expected Results:**
- ✅ Appointment created successfully
- ✅ Status set to "confirmed"
- ✅ Appointment appears on calendar
- ✅ Customer receives confirmation email (if emails enabled)
- ✅ Success toast notification

### Test Scenario 13: Manage Appointment Status
**Steps:**
1. Go to `/calendar` or `/dashboard`
2. Click on an appointment
3. Change status using dropdown:
   - Pending → Confirmed
   - Confirmed → Completed
   - Any → Cancelled (requires reason)
4. For cancellation, enter reason
5. Confirm status change

**Expected Results:**
- ✅ Status updated successfully
- ✅ Cancellation requires reason
- ✅ Email sent on status change (if enabled)
- ✅ Status reflected in calendar/list view
- ✅ Past appointments auto-completed

### Test Scenario 14: Reschedule Appointment (Business)
**Steps:**
1. Go to `/calendar` or `/dashboard`
2. Click on a pending/confirmed appointment
3. Click "Reschedule"
4. Select new date and time
5. Verify availability
6. Click "Reschedule Appointment"

**Expected Results:**
- ✅ New date/time selected
- ✅ Availability checked
- ✅ Conflicts prevented
- ✅ Appointment updated
- ✅ Customer notified via email (if enabled)
- ✅ Old time slot freed up

### Test Scenario 15: View Business Analytics
**Steps:**
1. Go to `/dashboard`
2. Scroll to "Business Analytics"
3. View metrics:
   - Total bookings
   - Revenue
   - Completed appointments
   - Total customers
4. View charts:
   - Popular services
   - Peak hours
   - Booking status breakdown
   - Recent activity trends

**Expected Results:**
- ✅ All metrics displayed correctly
- ✅ Charts render properly
- ✅ Data accurate
- ✅ Empty state shown if no data

---

## Customer Testing

### Test Scenario 16: Search Businesses
**Steps:**
1. Go to homepage (`/`)
2. Use search bar:
   - Search by business name
   - Search by location/city
3. Use category filter
4. Click on a business card

**Expected Results:**
- ✅ Search results update in real-time
- ✅ Filtering works correctly
- ✅ Business cards clickable
- ✅ Navigate to business detail page

### Test Scenario 17: Advanced Filters
**Steps:**
1. Go to homepage
2. Click "Filters" button
3. Apply filters:
   - Price range (min/max)
   - Minimum rating (1-5 stars)
   - Availability (only businesses with open slots)
4. Sort by:
   - Highest rated
   - Lowest price
   - Highest price
5. Clear filters

**Expected Results:**
- ✅ Filters applied correctly
- ✅ Results filtered appropriately
- ✅ Sort order works
- ✅ Filter badges displayed
- ✅ Can clear all filters
- ✅ URL parameters persist

### Test Scenario 18: View Business Details
**Steps:**
1. Click on a business card
2. View business information:
   - Name, type, description
   - Address and contact info
   - Logo and cover image
   - Services list with prices
   - Ratings and reviews
3. Scroll through services
4. View reviews

**Expected Results:**
- ✅ All business info displayed
- ✅ Images loaded correctly
- ✅ Services listed with prices
- ✅ Reviews and ratings visible
- ✅ Average rating calculated correctly

### Test Scenario 19: Book Appointment
**Steps:**
1. Go to business detail page
2. Click "Book Appointment" on a service
3. Fill in booking form:
   - Select date (calendar)
   - Select time (from available slots)
   - Name (pre-filled)
   - Email (pre-filled)
   - Phone (optional)
   - Notes (optional)
4. Click "Book Appointment"
5. Verify booking constraints:
   - Minimum booking window (e.g., 2 hours in advance)
   - Maximum booking window (e.g., 30 days)
   - Buffer time between appointments
   - Business/service active status

**Expected Results:**
- ✅ Calendar opens for date selection
- ✅ Only available slots shown
- ✅ Past dates disabled
- ✅ Booking window enforced
- ✅ Appointment created successfully
- ✅ Status set to "pending"
- ✅ Confirmation email sent (if enabled)
- ✅ Success toast notification
- ✅ Redirected to customer dashboard

### Test Scenario 20: View My Bookings
**Steps:**
1. Sign in as customer
2. Click "My Bookings" in header or go to `/my-bookings`
3. View:
   - Upcoming appointments
   - Past appointments
4. Click on an appointment

**Expected Results:**
- ✅ Upcoming appointments listed
- ✅ Past appointments listed separately
- ✅ Appointment details shown
- ✅ Status badges displayed
- ✅ Can view full details

### Test Scenario 21: Cancel Appointment (Customer)
**Steps:**
1. Go to `/my-bookings`
2. Click on an upcoming appointment
3. Click "Cancel"
4. Enter cancellation reason (required)
5. Read cancellation policy
6. Confirm cancellation

**Expected Results:**
- ✅ Cancellation dialog opens
- ✅ Reason required
- ✅ Policy displayed
- ✅ Late cancellation warning shown (if within 24h)
- ✅ Appointment cancelled
- ✅ Status updated to "cancelled"
- ✅ Email notification sent (if enabled)
- ✅ Time slot freed up

### Test Scenario 22: Reschedule Appointment (Customer)
**Steps:**
1. Go to `/my-bookings`
2. Click on an upcoming appointment
3. Click "Reschedule"
4. Select new date and time
5. Verify availability
6. Click "Reschedule Appointment"

**Expected Results:**
- ✅ Reschedule dialog opens
- ✅ New date/time selectable
- ✅ Availability checked
- ✅ Conflicts prevented
- ✅ Appointment updated
- ✅ Email notification sent (if enabled)
- ✅ Old time slot freed up

### Test Scenario 23: Leave Review
**Steps:**
1. Go to `/my-bookings`
2. Find a completed appointment
3. Click "Leave Review"
4. Select rating (1-5 stars)
5. Write review text
6. Click "Submit Review"

**Expected Results:**
- ✅ Review form opens
- ✅ Rating required
- ✅ Review text optional
- ✅ Review submitted successfully
- ✅ Review appears on business page
- ✅ Business rating updated
- ✅ Email notification sent to business (if enabled)

---

## Calendar Management Testing

### Test Scenario 24: Calendar View Navigation
**Steps:**
1. Go to `/calendar`
2. Click previous month arrow (←)
3. Click next month arrow (→)
4. Click "Today" button
5. Navigate to different months

**Expected Results:**
- ✅ Month changes correctly
- ✅ Appointments displayed on correct dates
- ✅ Today button returns to current month
- ✅ Calendar grid updates correctly

### Test Scenario 25: View Multiple Appointments on Same Day
**Steps:**
1. Go to `/calendar`
2. Find a day with 3+ appointments
3. View first 3 appointments
4. Click "+X more" button
5. View all appointments in popover
6. Click on an appointment in popover

**Expected Results:**
- ✅ First 3 appointments visible
- ✅ "+X more" button shown
- ✅ Popover opens with all appointments
- ✅ Can click appointments in popover
- ✅ Details dialog opens

### Test Scenario 26: Create Appointment from Date Click
**Steps:**
1. Go to `/calendar`
2. Click on any date
3. Verify dialog opens with date pre-filled
4. Complete appointment creation

**Expected Results:**
- ✅ Create dialog opens
- ✅ Date pre-selected
- ✅ Can complete appointment creation

### Test Scenario 27: Filter Appointments by Status
**Steps:**
1. Go to `/calendar`
2. Use status filter dropdown:
   - All Statuses
   - Pending
   - Confirmed
   - Completed
   - Cancelled
3. Verify calendar updates

**Expected Results:**
- ✅ Filter dropdown works
- ✅ Calendar shows only filtered appointments
- ✅ Filter persists during navigation

---

## Search & Filter Testing

### Test Scenario 28: Price Range Filter
**Steps:**
1. Go to homepage
2. Open filters
3. Set minimum price (e.g., $20)
4. Set maximum price (e.g., $100)
5. Apply filter

**Expected Results:**
- ✅ Only businesses with services in price range shown
- ✅ Slider controls work smoothly
- ✅ Filter badge shows active range
- ✅ Results update correctly

### Test Scenario 29: Rating Filter
**Steps:**
1. Go to homepage
2. Open filters
3. Set minimum rating (e.g., 4 stars)
4. Apply filter

**Expected Results:**
- ✅ Only businesses with rating ≥ selected shown
- ✅ Filter badge shows active rating
- ✅ Results update correctly

### Test Scenario 30: Availability Filter
**Steps:**
1. Go to homepage
2. Open filters
3. Check "Show only businesses with available appointments"
4. Apply filter

**Expected Results:**
- ✅ Only businesses with open slots in next 7 days shown
- ✅ Filter badge displayed
- ✅ Results update correctly

### Test Scenario 31: Sort Options
**Steps:**
1. Go to homepage
2. Open filters
3. Try each sort option:
   - Highest Rated
   - Lowest Price
   - Highest Price
4. Verify results order

**Expected Results:**
- ✅ Results sorted correctly
- ✅ Sort persists
- ✅ Filter badge shows active sort

---

## Edge Cases & Error Handling

### Test Scenario 32: Booking Race Condition
**Steps:**
1. Open two browser windows/tabs
2. Both as same customer
3. Select same business, service, date, and time
4. Try to book simultaneously
5. Submit both forms at nearly the same time

**Expected Results:**
- ✅ Only one booking succeeds
- ✅ Other booking shows "time slot unavailable" error
- ✅ No double bookings created
- ✅ Database integrity maintained

### Test Scenario 33: Booking Window Validation
**Steps:**
1. Try to book:
   - Less than 2 hours in advance (should fail)
   - More than 30 days in advance (should fail)
   - Within valid window (should succeed)

**Expected Results:**
- ✅ Minimum window enforced
- ✅ Maximum window enforced
- ✅ Clear error messages
- ✅ Valid bookings succeed

### Test Scenario 34: Buffer Time
**Steps:**
1. Book an appointment
2. Try to book another appointment:
   - Immediately before existing appointment
   - Immediately after existing appointment
   - Overlapping with existing appointment

**Expected Results:**
- ✅ 15-minute buffer enforced
- ✅ Overlapping slots unavailable
- ✅ Clear error messages
- ✅ Valid bookings succeed

### Test Scenario 35: Inactive Business/Service
**Steps:**
1. As business owner, deactivate a service
2. As customer, try to book that service
3. As business owner, deactivate business
4. As customer, try to book from that business

**Expected Results:**
- ✅ Inactive services not bookable
- ✅ Inactive businesses not bookable
- ✅ Clear error messages
- ✅ Active services/businesses still work

### Test Scenario 36: No Services Available
**Steps:**
1. Create business without services
2. Try to book from that business
3. As business owner, try to create appointment without services

**Expected Results:**
- ✅ Cannot book without services
- ✅ Warning message shown
- ✅ Cannot create appointment without services
- ✅ Clear guidance provided

### Test Scenario 37: No Business Hours
**Steps:**
1. Create business without setting hours
2. Try to book appointment

**Expected Results:**
- ✅ No time slots available
- ✅ Clear message about business hours
- ✅ Guidance to set hours

### Test Scenario 38: Past Appointments
**Steps:**
1. View appointments older than today
2. Verify status
3. Try to reschedule past appointment
4. Try to cancel past appointment

**Expected Results:**
- ✅ Past appointments marked as "completed"
- ✅ Cannot reschedule past appointments
- ✅ Cannot cancel past appointments
- ✅ Can leave reviews for past appointments

### Test Scenario 39: Unconfirmed Appointments
**Steps:**
1. Book appointment (status: pending)
2. Wait 24 hours without confirmation
3. Verify automatic cancellation (if enabled)

**Expected Results:**
- ✅ Unconfirmed appointments auto-cancelled after 24h
- ✅ Customer notified (if emails enabled)
- ✅ Time slot freed up

### Test Scenario 40: Image Upload Errors
**Steps:**
1. Try to upload:
   - Very large file (>5MB)
   - Invalid file type (not image)
   - Corrupted file
2. Try to upload valid image

**Expected Results:**
- ✅ File size validation
- ✅ File type validation
- ✅ Clear error messages
- ✅ Valid images upload successfully

### Test Scenario 41: Form Validation
**Steps:**
1. Try to submit forms with:
   - Empty required fields
   - Invalid email format
   - Invalid phone format
   - Invalid URL format
   - Text exceeding max length

**Expected Results:**
- ✅ All required fields validated
- ✅ Email format validated
- ✅ Phone format validated (if provided)
- ✅ URL format validated (if provided)
- ✅ Max length enforced
- ✅ Clear validation messages

### Test Scenario 42: Network Errors
**Steps:**
1. Disconnect internet
2. Try to:
   - Create appointment
   - Update business profile
   - Upload image
3. Reconnect internet
4. Verify data synced

**Expected Results:**
- ✅ Network errors caught gracefully
- ✅ User-friendly error messages
- ✅ Data syncs when connection restored
- ✅ No data loss

---

## Testing Checklist

Use this checklist to ensure all features are tested:

### Authentication
- [ ] Sign up
- [ ] Email verification
- [ ] Sign in
- [ ] Sign out
- [ ] Password reset (if implemented)

### Business Owner Features
- [ ] Create business profile
- [ ] Edit business profile
- [ ] Upload logo
- [ ] Upload cover image
- [ ] AI business setup (if enabled)
- [ ] Add service
- [ ] Edit service
- [ ] Delete service
- [ ] Upload service image
- [ ] Set business hours
- [ ] View appointments list
- [ ] View calendar
- [ ] Create appointment from calendar
- [ ] Update appointment status
- [ ] Reschedule appointment
- [ ] Cancel appointment with reason
- [ ] View analytics dashboard

### Customer Features
- [ ] Search businesses
- [ ] Filter by category
- [ ] Advanced filters (price, rating, availability)
- [ ] Sort options
- [ ] View business details
- [ ] Book appointment
- [ ] View my bookings
- [ ] Cancel appointment
- [ ] Reschedule appointment
- [ ] Leave review
- [ ] View reviews

### Calendar Features
- [ ] Navigate months
- [ ] Today button
- [ ] View appointments
- [ ] "+X more" popover
- [ ] Click appointment for details
- [ ] Click date to create appointment
- [ ] Status filtering
- [ ] Color coding

### Edge Cases
- [ ] Booking race conditions
- [ ] Booking window validation
- [ ] Buffer time enforcement
- [ ] Inactive business/service
- [ ] No services/hours
- [ ] Past appointments
- [ ] Image upload errors
- [ ] Form validation
- [ ] Network errors

---

## Common Issues & Solutions

### Issue: White screen on dialog open
**Solution:** Check browser console for errors. Verify all imports are correct.

### Issue: Appointments not appearing
**Solution:** 
- Verify RLS policies are set correctly
- Check appointment status filters
- Refresh page

### Issue: Cannot create appointment
**Solution:**
- Verify `ALLOW_BUSINESS_OWNERS_CREATE_APPOINTMENTS.sql` was run
- Check browser console for errors
- Verify services exist and are active

### Issue: Images not uploading
**Solution:**
- Verify `SETUP_STORAGE.sql` was run
- Check file size (max 5MB)
- Verify file type (images only)
- Check RLS policies for storage

### Issue: Email notifications not working
**Solution:**
- Verify Edge Function deployed
- Check Resend API key configured
- Verify `SETUP_EMAIL_NOTIFICATIONS.sql` was run
- Check Supabase secrets

---

## Performance Testing

### Test Scenario 43: Load Time
**Steps:**
1. Clear browser cache
2. Load homepage
3. Measure time to first contentful paint
4. Load dashboard
5. Measure load time

**Expected Results:**
- ✅ Homepage loads in < 2 seconds
- ✅ Dashboard loads in < 3 seconds
- ✅ Images lazy load
- ✅ Smooth scrolling

### Test Scenario 44: Large Data Sets
**Steps:**
1. Create 50+ businesses
2. Create 100+ appointments
3. Load homepage
4. Load calendar
5. Apply filters

**Expected Results:**
- ✅ Pagination or lazy loading implemented
- ✅ No performance degradation
- ✅ Filters work smoothly
- ✅ Calendar renders correctly

---

## Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## Notes

- All dates/times should respect timezone settings
- Email notifications are optional but recommended
- AI features require OpenAI API key
- Some features may require Supabase Pro plan (e.g., pg_cron)

---

**Last Updated:** January 2025
**Version:** 1.0


