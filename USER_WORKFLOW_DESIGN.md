# User Workflow Design - SelfHub AI
## Based on Booksy.com Model

---

## 🎯 Overview

SelfHub AI serves two distinct user types with different needs and workflows:

1. **Customers** - People looking to book beauty/wellness services
2. **Business Owners** - Service providers listing their businesses on the platform

---

## 👥 USER TYPE 1: CUSTOMERS

### Customer Journey Map

```
Landing → Search/Discover → View Business → Book Service → Manage Bookings → Review
```

### Phase 1: Discovery & Search

**Entry Points:**
- Homepage (Index page) ✅ *Current: Implemented*
- Direct business URL
- Search results
- Category browsing

**Current State:**
- ✅ Search by name, location, category
- ✅ Advanced filters (price, rating, availability)
- ✅ Business cards with key info
- ✅ Category filtering

**Booksy Reference Features:**
- 🔄 **Map view** - Visual location-based search
- 🔄 **"Near me" detection** - Auto-detect location
- 🔄 **Popular/Featured businesses** - Highlighted on homepage
- 🔄 **Recent searches** - Quick access to previous searches
- 🔄 **Saved businesses** - Favorite/bookmark businesses

**Recommended Flow:**
1. Customer lands on homepage
2. See featured/popular businesses (if logged in, personalized)
3. Search bar at top (always visible)
4. Filter by:
   - Category (salon, barbershop, spa, etc.)
   - Location (city, "near me")
   - Price range
   - Rating
   - Availability (has slots today/tomorrow)
5. Results show:
   - Business name, rating, location
   - Price range
   - Next available slot
   - Distance (if location enabled)
   - Quick "Book Now" button

---

### Phase 2: Business Detail View

**Current State:**
- ✅ Business information display
- ✅ Services list with prices
- ✅ Reviews display
- ✅ Booking dialog

**Booksy Reference Features:**
- ✅ **Service details** - Duration, price, description
- ✅ **Business hours** - Displayed clearly
- ✅ **Reviews & ratings** - Customer feedback
- 🔄 **Photo gallery** - Multiple business images
- 🔄 **Staff profiles** - If applicable
- 🔄 **Special offers** - Promotions/discounts
- 🔄 **Business description** - More detailed
- 🔄 **Location map** - Embedded map
- 🔄 **Social proof** - "X people booked this week"

**Recommended Flow:**
1. Customer clicks on business card
2. Land on business detail page
3. See:
   - Hero image/cover
   - Business name, rating, location
   - Quick info (hours, phone, website)
   - Services grid/list
   - Reviews section
   - "Book Appointment" CTA (sticky/fixed)
4. Scroll to see more details
5. Click service to see details
6. Click "Book Now" → Opens booking flow

---

### Phase 3: Booking Flow

**Current State:**
- ✅ Booking dialog with service selection
- ✅ Date/time picker
- ✅ Customer info form
- ✅ Availability checking
- ✅ Race condition protection

**Booksy Reference Flow:**
1. **Service Selection**
   - Customer selects service(s)
   - Can add multiple services (package)
   - See total price and duration
   - Service descriptions visible

2. **Date & Time Selection**
   - Calendar view (month view)
   - Available dates highlighted
   - Time slots shown for selected date
   - Real-time availability
   - Buffer time between appointments

3. **Customer Information**
   - If logged in: Auto-fill from profile
   - If guest: Name, email, phone required
   - Special requests/notes field
   - Preferred contact method

4. **Confirmation**
   - Review booking details
   - Total price
   - Appointment summary
   - Terms & conditions checkbox
   - "Confirm Booking" button

5. **Post-Booking**
   - Success message
   - Booking confirmation email
   - Add to calendar option
   - View booking in "My Bookings"

**Current Implementation:**
- ✅ Service selection
- ✅ Date/time picker
- ✅ Customer info form
- ✅ Availability checking
- 🔄 **Multi-service booking** - Not implemented
- 🔄 **Guest booking** - Requires login currently
- 🔄 **Calendar integration** - Not implemented
- ✅ Email confirmation

**Improvements Needed:**
1. Allow guest bookings (optional account creation)
2. Multi-service selection
3. Package deals
4. Recurring appointments
5. Waitlist for full days
6. SMS notifications (optional)

---

### Phase 4: Booking Management (Customer)

**Current State:**
- ✅ Customer Dashboard (`/my-bookings`)
- ✅ View upcoming/past appointments
- ✅ Cancel appointments
- ✅ Reschedule appointments

**Booksy Reference Features:**
- ✅ **Upcoming appointments** - List view
- ✅ **Past appointments** - History
- ✅ **Cancel/Reschedule** - Self-service
- 🔄 **Booking reminders** - Email/SMS before appointment
- 🔄 **Quick rebook** - "Book again" button
- 🔄 **Receipt/invoice** - Download booking confirmation
- 🔄 **Review prompt** - After completed appointment
- 🔄 **Loyalty points** - If implemented

**Recommended Flow:**
1. Customer clicks "My Bookings" (header menu)
2. See tabs:
   - **Upcoming** - Next appointments
   - **Past** - Completed/cancelled
3. For each appointment:
   - Business name, service, date/time
   - Status badge (confirmed, pending, etc.)
   - Actions: View details, Reschedule, Cancel
4. Click appointment → See full details
5. After completion → Prompt for review

**Current Implementation:**
- ✅ View bookings
- ✅ Cancel with reason
- ✅ Reschedule
- 🔄 **Review prompt** - Manual currently
- 🔄 **Reminders** - Not automated

---

### Phase 5: Reviews & Feedback

**Current State:**
- ✅ Review form
- ✅ Reviews display on business page
- ✅ Rating system

**Booksy Reference:**
- ✅ **Star rating** - 1-5 stars
- ✅ **Written review** - Optional
- ✅ **Photo upload** - Not implemented
- 🔄 **Review moderation** - Not implemented
- 🔄 **Response from business** - Not implemented
- 🔄 **Helpful votes** - Not implemented

**Recommended Flow:**
1. After appointment completion (status = "completed")
2. Show review prompt (toast/email)
3. Customer clicks "Leave Review"
4. Rate 1-5 stars
5. Write review (optional)
6. Upload photos (optional)
7. Submit review
8. Review appears on business page (after moderation if needed)

---

## 🏢 USER TYPE 2: BUSINESS OWNERS

### Business Owner Journey Map

```
Sign Up → Onboard → Set Up Profile → Manage Services → Receive Bookings → Grow Business
```

### Phase 1: Onboarding

**Current State:**
- ✅ Sign up with email
- ✅ Email verification
- ✅ Business creation form
- ✅ AI Quick Setup (optional)

**Booksy Reference Flow:**
1. **Sign Up**
   - Email/password
   - Business email preferred
   - Email verification required

2. **Business Setup**
   - Manual form OR
   - AI Quick Setup (describe business)
   - Step-by-step wizard:
     - Step 1: Basic info (name, type, location)
     - Step 2: Services (add services)
     - Step 3: Hours (set operating hours)
     - Step 4: Images (logo, cover, service photos)
     - Step 5: Review & publish

3. **Verification**
   - Email verification
   - Business verification (optional - manual review)
   - Phone verification (optional)

**Current Implementation:**
- ✅ Sign up
- ✅ Email verification
- ✅ Business creation form
- ✅ AI Quick Setup
- 🔄 **Step-by-step wizard** - Single form currently
- 🔄 **Business verification** - Not implemented

**Improvements Needed:**
1. Multi-step onboarding wizard
2. Progress indicator
3. Skip options (can complete later)
4. Business verification badge
5. Onboarding checklist

---

### Phase 2: Business Profile Management

**Current State:**
- ✅ Dashboard (`/dashboard`)
- ✅ Edit business profile
- ✅ Upload logo/cover images
- ✅ View business page

**Booksy Reference Features:**
- ✅ **Profile editing** - All fields
- ✅ **Image management** - Logo, cover, gallery
- ✅ **Business description** - SEO-friendly
- 🔄 **Social media links** - Not implemented
- 🔄 **Business verification badge** - Not implemented
- 🔄 **Profile completion score** - Not implemented
- 🔄 **SEO preview** - How it appears in search

**Recommended Dashboard Layout:**
```
┌─────────────────────────────────────┐
│  Business Profile Overview          │
│  - Status (Active/Inactive)         │
│  - Profile completion %             │
│  - Quick stats (views, bookings)    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Quick Actions                      │
│  - Edit Profile                     │
│  - Add Service                      │
│  - View Bookings                    │
│  - View Analytics                   │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Recent Activity                    │
│  - New bookings                     │
│  - New reviews                      │
│  - Pending actions                  │
└─────────────────────────────────────┘
```

**Current Implementation:**
- ✅ Profile editing
- ✅ Image uploads
- ✅ View business page
- 🔄 **Profile completion** - Not tracked
- 🔄 **Quick stats** - Basic analytics only

---

### Phase 3: Services Management

**Current State:**
- ✅ Services Management component
- ✅ Add/Edit/Delete services
- ✅ Service images
- ✅ Pricing and duration

**Booksy Reference Features:**
- ✅ **Service CRUD** - Full management
- ✅ **Service images** - Visual representation
- ✅ **Pricing** - Set prices
- ✅ **Duration** - Service length
- 🔄 **Service categories** - Not implemented
- 🔄 **Service packages** - Multiple services bundled
- 🔄 **Add-ons** - Optional extras
- 🔄 **Service availability** - Per-service hours
- 🔄 **Staff assignment** - Not applicable (single owner)

**Recommended Flow:**
1. Go to Dashboard → Services section
2. See list of all services
3. Actions:
   - Add new service
   - Edit existing
   - Delete (with confirmation)
   - Toggle active/inactive
4. For each service:
   - Name, description, price, duration
   - Image
   - Active status
   - Number of bookings

**Current Implementation:**
- ✅ Full CRUD operations
- ✅ Service images
- ✅ Active/inactive toggle
- 🔄 **Service analytics** - Not implemented
- 🔄 **Popular services** - Not tracked

---

### Phase 4: Business Hours Management

**Current State:**
- ✅ Business Hours Management
- ✅ Set hours per day
- ✅ Open/closed toggle
- ✅ Time picker

**Booksy Reference:**
- ✅ **Weekly hours** - All 7 days
- ✅ **Holiday hours** - Not implemented
- ✅ **Special hours** - Not implemented
- 🔄 **Break times** - Lunch breaks, etc.
- 🔄 **Buffer time** - Between appointments
- 🔄 **Service-specific hours** - Different hours per service

**Recommended Features:**
1. Standard weekly hours (current)
2. Holiday calendar (mark days as closed)
3. Special hours (e.g., extended hours on weekends)
4. Break times (lunch, etc.)
5. Buffer time settings (15 min between appointments)

**Current Implementation:**
- ✅ Weekly hours
- ✅ Open/closed per day
- 🔄 **Holidays** - Not implemented
- 🔄 **Special hours** - Not implemented

---

### Phase 5: Booking Management

**Current State:**
- ✅ Bookings Management component
- ✅ List view
- ✅ Calendar view
- ✅ Status management
- ✅ Reschedule/Cancel
- ✅ Create appointment (for walk-ins)

**Booksy Reference Features:**
- ✅ **Appointment list** - All bookings
- ✅ **Calendar view** - Visual calendar
- ✅ **Status management** - Pending, confirmed, completed, cancelled
- ✅ **Reschedule** - Change date/time
- ✅ **Cancel** - With reason
- ✅ **Create appointment** - Manual booking
- 🔄 **Bulk actions** - Not implemented
- 🔄 **Export** - Not implemented
- 🔄 **Filters** - Status, date range, service
- 🔄 **Search** - Customer name, phone, email
- 🔄 **Appointment notes** - Internal notes (not customer notes)

**Recommended Flow:**
1. Go to Dashboard → Bookings section
2. Toggle between:
   - **List View** - Table/list of appointments
   - **Calendar View** - Monthly calendar
3. Filter by:
   - Status (all, pending, confirmed, etc.)
   - Date range
   - Service
   - Customer (search)
4. For each appointment:
   - Customer info (name, phone, email)
   - Service, date, time
   - Status badge
   - Actions: Confirm, Reschedule, Cancel, Complete
5. Click appointment → Full details modal
6. Can add internal notes (not visible to customer)

**Current Implementation:**
- ✅ List and calendar views
- ✅ Status management
- ✅ Reschedule/Cancel
- ✅ Create appointment
- ✅ Status filtering
- 🔄 **Customer search** - Not implemented
- 🔄 **Internal notes** - Not implemented
- 🔄 **Bulk actions** - Not implemented

---

### Phase 6: Analytics & Growth

**Current State:**
- ✅ Business Analytics component
- ✅ Basic stats (bookings, revenue, customers)

**Booksy Reference Features:**
- ✅ **Revenue tracking** - Total earnings
- ✅ **Booking stats** - Count, trends
- ✅ **Customer stats** - New vs returning
- 🔄 **Service popularity** - Which services book most
- 🔄 **Peak times** - Busiest days/hours
- 🔄 **Cancellation rate** - Track cancellations
- 🔄 **Review analytics** - Average rating, review count
- 🔄 **Growth metrics** - Month-over-month
- 🔄 **Export reports** - CSV/PDF

**Recommended Dashboard:**
```
┌─────────────────────────────────────┐
│  Overview (This Month)             │
│  - Total Bookings: 45               │
│  - Revenue: $2,340                  │
│  - New Customers: 12                │
│  - Avg Rating: 4.8 ⭐               │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Charts                              │
│  - Bookings over time (line chart)   │
│  - Revenue by service (bar chart)   │
│  - Peak booking times (heatmap)    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Top Services                       │
│  1. Haircut - 20 bookings           │
│  2. Beard Trim - 15 bookings        │
│  3. Hot Towel Shave - 10 bookings   │
└─────────────────────────────────────┘
```

**Current Implementation:**
- ✅ Basic analytics
- ✅ Revenue tracking
- ✅ Customer stats
- 🔄 **Charts/visualizations** - Basic only
- 🔄 **Service analytics** - Not implemented
- 🔄 **Time-based analytics** - Not implemented

---

## 🔄 KEY INTERACTIONS & FLOWS

### Flow 1: Customer Books Appointment

```
1. Customer searches/browses businesses
2. Clicks on business
3. Views business details & services
4. Clicks "Book Now" or selects service
5. Selects date & time
6. Fills customer information
7. Reviews booking details
8. Confirms booking
9. Receives confirmation email
10. Booking appears in "My Bookings"
```

**Current State:** ✅ Fully implemented

---

### Flow 2: Business Owner Receives Booking

```
1. Customer books appointment
2. Business owner receives:
   - Email notification (if configured)
   - Booking appears in Dashboard
   - Notification badge (if implemented)
3. Owner views booking in:
   - Bookings list
   - Calendar view
4. Owner can:
   - Confirm booking
   - Reschedule (if needed)
   - Cancel (with reason)
   - Add internal notes
5. Customer receives status update email
```

**Current State:** 
- ✅ Booking appears in dashboard
- ✅ Email notifications (if configured)
- ✅ Status management
- 🔄 **Push notifications** - Not implemented
- 🔄 **SMS notifications** - Not implemented

---

### Flow 3: Customer Cancels/Reschedules

```
1. Customer goes to "My Bookings"
2. Finds upcoming appointment
3. Clicks "Cancel" or "Reschedule"
4. If cancel: Selects reason, confirms
5. If reschedule: Selects new date/time
6. Booking status updates
7. Business owner notified
8. Confirmation email sent
```

**Current State:** ✅ Fully implemented

---

### Flow 4: Business Owner Creates Appointment

```
1. Owner goes to Calendar or Bookings
2. Clicks "Create Appointment" or clicks date
3. Selects service
4. Selects date & time
5. Enters customer info (name, email, phone)
6. Adds notes (optional)
7. Creates appointment
8. Appointment auto-confirmed
9. Customer receives confirmation email
```

**Current State:** ✅ Fully implemented

---

### Flow 5: Post-Appointment Review

```
1. Appointment status changes to "completed"
2. Customer receives review prompt (email/toast)
3. Customer clicks "Leave Review"
4. Rates 1-5 stars
5. Writes review (optional)
6. Submits review
7. Review appears on business page
8. Business rating updates
9. Owner can respond (if implemented)
```

**Current State:**
- ✅ Review form
- ✅ Review display
- 🔄 **Auto-prompt after completion** - Manual currently
- 🔄 **Owner response** - Not implemented

---

## 🎨 UX IMPROVEMENTS NEEDED

### For Customers:

1. **Discovery**
   - [ ] Map view for location-based search
   - [ ] "Near me" auto-detection
   - [ ] Saved/favorite businesses
   - [ ] Recent searches
   - [ ] Popular/trending businesses

2. **Booking**
   - [ ] Guest booking (no account required)
   - [ ] Multi-service selection
   - [ ] Package deals
   - [ ] Recurring appointments
   - [ ] Waitlist for full days
   - [ ] Calendar integration (Google Calendar, iCal)

3. **Management**
   - [ ] Booking reminders (email/SMS)
   - [ ] Quick rebook button
   - [ ] Download receipt/invoice
   - [ ] Booking history export

4. **Reviews**
   - [ ] Photo uploads in reviews
   - [ ] Review moderation
   - [ ] Helpful votes

### For Business Owners:

1. **Onboarding**
   - [ ] Multi-step wizard
   - [ ] Progress indicator
   - [ ] Onboarding checklist
   - [ ] Business verification process

2. **Management**
   - [ ] Bulk actions (confirm multiple bookings)
   - [ ] Customer search/filter
   - [ ] Internal notes (not visible to customers)
   - [ ] Export bookings (CSV/PDF)
   - [ ] Holiday calendar
   - [ ] Special hours
   - [ ] Break times

3. **Analytics**
   - [ ] Service popularity charts
   - [ ] Peak time analysis
   - [ ] Cancellation rate tracking
   - [ ] Growth metrics
   - [ ] Export reports

4. **Communication**
   - [ ] SMS notifications
   - [ ] Push notifications
   - [ ] Customer messaging (in-app)
   - [ ] Review responses

---

## 📊 PRIORITY FEATURES (Based on Booksy)

### High Priority (MVP+)
1. ✅ Search & Discovery
2. ✅ Booking Flow
3. ✅ Business Management
4. ✅ Booking Management
5. 🔄 Guest Booking
6. 🔄 Map View
7. 🔄 Multi-step Onboarding
8. 🔄 Enhanced Analytics

### Medium Priority
1. 🔄 SMS Notifications
2. 🔄 Calendar Integration
3. 🔄 Review Responses
4. 🔄 Service Packages
5. 🔄 Holiday Calendar

### Low Priority (Nice to Have)
1. 🔄 Loyalty Program
2. 🔄 Staff Management
3. 🔄 Online Payments
4. 🔄 Marketing Tools
5. 🔄 Customer Messaging

---

## 🎯 RECOMMENDED NEXT STEPS

1. **Improve Customer Discovery**
   - Add map view
   - Implement "near me" detection
   - Add saved businesses feature

2. **Enhance Booking Flow**
   - Allow guest bookings
   - Add multi-service selection
   - Implement calendar integration

3. **Better Business Onboarding**
   - Create multi-step wizard
   - Add progress tracking
   - Improve AI setup flow

4. **Advanced Analytics**
   - Service popularity tracking
   - Peak time analysis
   - Growth metrics

5. **Communication Improvements**
   - SMS notifications
   - Push notifications
   - Review response system

---

**Last Updated:** January 2025
**Reference:** Booksy.com user flows and features

