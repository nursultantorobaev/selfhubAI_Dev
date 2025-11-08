# User Role Separation Design Document

## 🎯 Goal
Create a clear separation between Customer and Business Owner experiences with distinct workflows, landing pages, and navigation.

---

## 📊 Current State Analysis

### What We Have:
- ✅ `is_business_owner` flag in profiles table
- ✅ Separate dashboards: `/dashboard` (business) and `/my-bookings` (customer)
- ✅ Business profile creation sets `is_business_owner = true`
- ✅ Header shows different menu items based on role
- ❌ No role selection during sign-up
- ❌ No role-based routing/redirects
- ❌ Same landing page for both user types
- ❌ No clear separation in sign-in flow

---

## 🏗️ Proposed Architecture

### 1. SIGN-UP FLOW

#### Option A: Role Selection First (Recommended)
```
Landing Page → Click "Sign Up" → Choose Role → Sign Up Form → Email Verification → Role-Specific Onboarding
```

**Flow:**
1. User clicks "Sign Up" on landing page
2. **Role Selection Screen** appears:
   - "I'm a Customer" (book services)
   - "I'm a Business Owner" (offer services)
   - Clear descriptions for each
3. User selects role → Sign up form appears
4. After sign-up → Email verification
5. After verification → Role-specific onboarding:
   - **Customer**: Welcome screen → Browse businesses
   - **Business**: Welcome screen → Business setup wizard

**Benefits:**
- Clear intent from the start
- Can customize sign-up form (business might need business email)
- Better analytics and user segmentation

#### Option B: Sign Up First, Choose Later
```
Landing Page → Sign Up → Email Verification → Role Selection → Role-Specific Onboarding
```

**Flow:**
1. User signs up (no role selection)
2. Email verification
3. **Role Selection Screen** after verification
4. Role-specific onboarding

**Benefits:**
- Simpler initial sign-up
- Users can explore before committing
- Can change role later

**Recommendation: Option A** - More intentional, better UX

---

### 2. SIGN-IN FLOW

#### Current: Generic sign-in → Manual navigation
#### Proposed: Role-based auto-redirect

```
Sign In → Check User Role → Auto-Redirect:
  - Customer → /customer/home or / (main search page)
  - Business Owner → /business/dashboard
  - No role set → Role selection screen
```

**Implementation:**
- After successful sign-in, check `profile.is_business_owner`
- Redirect based on role
- Store last visited page for "Remember me" functionality

---

### 3. LANDING PAGES

#### Current: Single landing page (`/`) for everyone
#### Proposed: Role-specific landing pages

**Customer Landing Page** (`/` or `/customer/home`):
- Hero: "Find Your Perfect Beauty & Wellness Service"
- Search bar (businesses, services, location)
- Featured businesses
- How it works (for customers)
- Popular services
- Testimonials
- CTA: "Browse Services" or "Find a Service"

**Business Landing Page** (`/business/home`):
- Hero: "Grow Your Beauty & Wellness Business"
- Key features for businesses
- Pricing/plans (if applicable)
- Success stories
- How it works (for businesses)
- CTA: "Start Your Free Trial" or "Get Started"

**Public Landing Page** (`/` - when not logged in):
- Dual hero sections or tabs:
  - Tab 1: "I'm Looking for Services" (customer view)
  - Tab 2: "I'm a Business Owner" (business view)
- Or split-screen design
- Clear CTAs for each user type

**Recommendation:** 
- Public users see dual-purpose landing page
- Logged-in users auto-redirect to role-specific page

---

### 4. ROUTING STRUCTURE

#### Proposed Route Organization:

```
PUBLIC ROUTES (No Auth Required):
/                           → Public landing page (dual-purpose)
/business/:id               → Business detail page (public)
/privacy                    → Privacy policy
/terms                      → Terms of service
/contact                    → Contact page

AUTH ROUTES (Requires Login):
/sign-up                    → Role selection → Sign up form
/sign-in                    → Sign in form
/reset-password             → Password reset

CUSTOMER ROUTES (Customer Role):
/customer/home              → Customer landing/dashboard
/customer/bookings          → My bookings (current /my-bookings)
/customer/profile           → Customer profile settings
/customer/favorites          → Saved businesses (future)

BUSINESS ROUTES (Business Owner Role):
/business/dashboard         → Business dashboard (current /dashboard)
/business/calendar          → Calendar view (current /calendar)
/business/bookings           → Manage bookings
/business/services           → Manage services
/business/hours               → Manage business hours
/business/analytics          → Business analytics
/business/settings           → Business settings
/business/profile             → Business profile page (public view)
```

#### Route Protection:
- **Protected Routes**: Require authentication
- **Role-Based Routes**: Require specific role
- **Redirect Logic**: 
  - Customer trying to access `/business/*` → Redirect to `/customer/home`
  - Business trying to access `/customer/*` → Redirect to `/business/dashboard`
  - No role set → Role selection screen

---

### 5. NAVIGATION STRUCTURE

#### Customer Navigation:
```
Header:
- Logo (links to /customer/home)
- Search bar
- Navigation:
  - Browse Services (/)
  - My Bookings (/customer/bookings)
  - Profile (dropdown)
    - My Profile
    - Settings
    - Sign Out
```

#### Business Navigation:
```
Header:
- Logo (links to /business/dashboard)
- Navigation:
  - Dashboard (/business/dashboard)
  - Calendar (/business/calendar)
  - Bookings (/business/bookings)
  - Services (/business/services)
  - Analytics (/business/analytics)
  - Profile (dropdown)
    - View Public Profile
    - Settings
    - Sign Out
```

#### Public Navigation:
```
Header:
- Logo (links to /)
- Navigation:
  - For Customers (link to customer sign-up)
  - For Businesses (link to business sign-up)
  - Sign In
```

---

### 6. DASHBOARD SEPARATION

#### Customer Dashboard (`/customer/home` or `/customer/bookings`):
**Purpose:** Manage bookings, discover services
**Features:**
- Upcoming appointments
- Past appointments
- Quick search for new services
- Favorite businesses
- Booking history
- Profile settings

#### Business Dashboard (`/business/dashboard`):
**Purpose:** Manage business, view analytics
**Features:**
- Today's appointments
- Revenue overview
- Recent bookings
- Quick actions (add service, update hours)
- Analytics summary
- Business profile status

---

### 7. ROLE SWITCHING

#### Scenario: User wants to be both Customer AND Business Owner

**Option A: Single Account, Dual Role**
- User can have both `is_business_owner = true` AND be a customer
- Toggle in profile: "Switch to Customer View" / "Switch to Business View"
- Both dashboards accessible
- Header shows both navigation options

**Option B: Separate Accounts**
- User must create separate accounts
- More complex but cleaner separation

**Recommendation: Option A** - More flexible, better UX

**Implementation:**
- Add role toggle in user menu
- Store current "view mode" in localStorage
- Show appropriate navigation based on current view
- Both dashboards accessible via toggle

---

### 8. ONBOARDING FLOWS

#### Customer Onboarding:
1. Sign up → Email verification
2. Welcome screen: "Welcome! Let's find you the perfect service"
3. Optional: Quick preferences (location, service types)
4. Redirect to main search page
5. Tooltip/guide: "How to book your first appointment"

#### Business Onboarding:
1. Sign up → Email verification
2. Welcome screen: "Let's set up your business"
3. **Multi-step wizard:**
   - Step 1: Business basics (name, type, location)
   - Step 2: Services (add services with prices)
   - Step 3: Business hours
   - Step 4: Contact info
   - Step 5: Images (logo, cover)
   - Step 6: Review & publish
4. After completion → Business dashboard
5. Tooltip/guide: "How to manage bookings"

---

### 9. AUTHENTICATION FLOW DIAGRAM

```
┌─────────────────┐
│  Landing Page   │
│      (/)        │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│Sign Up │ │ Sign In  │
└───┬────┘ └────┬─────┘
    │           │
    ▼           ▼
┌──────────┐ ┌──────────────┐
│Choose    │ │Check Role   │
│Role      │ │              │
└───┬──────┘ └───┬──────────┘
    │            │
    ▼            ▼
┌──────────┐ ┌──────────────┐
│Sign Up   │ │Redirect Based│
│Form      │ │on Role       │
└───┬──────┘ └───┬──────────┘
    │            │
    ▼            │
┌──────────┐     │
│Email     │     │
│Verify    │     │
└───┬──────┘     │
    │            │
    ▼            │
┌──────────┐     │
│Role      │     │
│Onboarding│     │
└───┬──────┘     │
    │            │
    └─────┬──────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌─────────┐ ┌──────────────┐
│Customer │ │Business      │
│Home     │ │Dashboard     │
└─────────┘ └──────────────┘
```

---

### 10. DATABASE CONSIDERATIONS

#### Current Schema:
- `profiles.is_business_owner` (boolean) - Set when business is created

#### Proposed Changes:
- Keep `is_business_owner` flag
- Add `user_role` enum: `'customer' | 'business_owner' | 'both'` (optional)
- Or keep boolean, use `is_business_owner` to determine role

**Recommendation:** Keep current schema, use `is_business_owner` flag

---

### 11. IMPLEMENTATION PHASES

#### Phase 1: Foundation (MVP)
- [ ] Add role selection to sign-up flow
- [ ] Create role-based redirect after sign-in
- [ ] Separate customer and business landing pages
- [ ] Update routing structure
- [ ] Add route protection middleware

#### Phase 2: Navigation & UX
- [ ] Create role-specific navigation components
- [ ] Update header for each role
- [ ] Add role toggle (if supporting dual roles)
- [ ] Improve onboarding flows

#### Phase 3: Advanced Features
- [ ] Role switching functionality
- [ ] Advanced route protection
- [ ] Analytics by user role
- [ ] Role-specific features

---

### 12. KEY DECISIONS NEEDED

1. **Sign-Up Flow:**
   - ✅ **DECIDED: Option A** - Role selection first

2. **Landing Pages:**
   - Public: Dual-purpose or separate?
   - Logged-in: Auto-redirect or manual navigation?

3. **Role Switching:**
   - Support dual roles (customer + business)?
   - Or require separate accounts?

4. **Route Structure:**
   - Use `/customer/*` and `/business/*` prefixes?
   - Or keep current routes with role-based access?

5. **Navigation:**
   - Completely separate headers?
   - Or same header with role-based menu items?

---

### 13. USER EXPERIENCE FLOW EXAMPLES

#### Example 1: New Customer
```
1. Visit site → See public landing page
2. Click "Sign Up as Customer"
3. Choose "I'm a Customer" → Fill form
4. Email verification
5. Welcome screen → Redirect to search page
6. Browse businesses → Book appointment
7. Access "My Bookings" from header
```

#### Example 2: New Business Owner
```
1. Visit site → See public landing page
2. Click "Sign Up as Business"
3. Choose "I'm a Business Owner" → Fill form
4. Email verification
5. Welcome screen → Business setup wizard
6. Complete setup → Business dashboard
7. Manage services, bookings, etc.
```

#### Example 3: Returning User
```
1. Visit site → Click "Sign In"
2. Enter credentials
3. System checks role:
   - Customer → Redirect to /customer/home
   - Business → Redirect to /business/dashboard
4. See role-specific dashboard
```

---

## 📝 SUMMARY

### Core Principles:
1. **Clear Separation**: Customer and Business experiences are distinct
2. **Role-Based Routing**: Automatic redirection based on user role
3. **Intentional Sign-Up**: Users choose their role upfront
4. **Consistent Navigation**: Role-specific navigation throughout
5. **Flexible Roles**: Support dual roles if needed

### Next Steps:
1. Review this design document
2. Make key decisions (marked above)
3. Create implementation plan
4. Start with Phase 1 (Foundation)

---

**Last Updated:** January 2025
**Status:** Design Phase - Awaiting Approval

