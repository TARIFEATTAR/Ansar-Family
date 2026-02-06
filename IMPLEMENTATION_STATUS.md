# Ansar Family — Implementation Status

## ✅ COMPLETED

### Core Infrastructure
- ✅ Database schema (users, intakes, ansars, partners, organizations, pairings, messages)
- ✅ Authentication (Clerk integration)
- ✅ Role-based access control (super_admin, partner_lead)
- ✅ Environment variables (Twilio, Resend)

### Forms & Submissions
- ✅ Seeker intake form (`/join`)
- ✅ Ansar application form (`/volunteer`)
- ✅ Partner application form (`/partner`)
- ✅ Partner-specific forms (`/[slug]/join`, `/[slug]/volunteer`)

### Notifications System
- ✅ Welcome SMS for Seekers (Twilio)
- ✅ Welcome Email for Seekers (Resend)
- ✅ Welcome SMS for Ansars (Twilio)
- ✅ Welcome Email for Ansars (Resend)
- ✅ Welcome SMS for Partners (Twilio)
- ✅ Welcome Email for Partners (Resend)
- ✅ Message audit logging

### Dashboards
- ✅ Super Admin Dashboard (`/admin`)
- ✅ Partner Lead Dashboard (`/dashboard/[slug]`)
- ✅ Pairing functionality

---

## 🚧 IN PROGRESS / NEXT STEPS

### 1. Seeker Journey Enhancements

#### New Muslim Resources Page (`/resources/new-muslim`)
**Status:** ❌ Not Started
**Requirements:**
- Clear framing: "These videos are just to get your feet wet"
- "Islam is lived with people, not just watched"
- Short basics video series (placeholders for now)
- Emergency hotline (Y Islam: 1-877-Y-ISLAM)
- Information about:
  - Weekly Jumu'ah times (shown once paired)
  - Monthly community gatherings (shown once paired)
- Simple public page, no authentication required
- Link sent in welcome SMS/Email

**Priority:** HIGH (Critical for onboarding)

---

### 2. Ansar Journey Enhancements

#### Terminology Update
**Status:** ⚠️ Partial
- Need to change "Becoming Ansar" → "Apply to be Ansar" on forms

#### Training System
**Status:** ❌ Not Started
**Requirements:**
- Training access after application review
- Training page with video completion tracking
- Two training modules:
  - Basics Training
  - Dawah & Welcome Training
- Status workflow: `pending` → `training` → `approved`
- Track: `hasCompletedTraining: boolean` (or training completion status)

**Priority:** HIGH (Required before Ansars can be activated)

#### Expectations Clarification
**Status:** ⚠️ Partial
- Need to add clear messaging on application form:
  - Primary role = showing up to events
  - Keep eyes open for new faces
  - Mentoring happens when needed

**Priority:** MEDIUM

---

### 3. Partner Hub Journey Enhancements

#### Community Overview Tab
**Status:** ❌ Not Started
**Requirements:**
- New tab in Partner Dashboard (separate from Pairing tab)
- Two simple lists:
  - **Seekers/New Muslims** (name, email, status)
  - **Ansars** (name, email, status: "applied" or "active")
- Select-all functionality
- Bulk email to selected groups
- Super lightweight, no complex CRM

**Priority:** HIGH (Core value prop)

#### Event Setup Toolkit
**Status:** ❌ Not Started
**Requirements:**
- Resource page (`/partner-resources` or in dashboard)
- Step-by-step guides:
  - How to create a simple flyer (Canva-style guidance)
  - How to set up an event page (e.g., Luma)
  - How to write a basic event description
  - How to send email invites via Ansar Family
  - How to share event links in local chat groups

**Priority:** MEDIUM

#### Partner Directory (Public-Facing)
**Status:** ❌ Not Started
**Requirements:**
- Public page listing all active partners
- Shows:
  - Community name
  - Monthly gathering times
  - Jumu'ah times
  - Location (city/state)
- Searchable/filterable by location

**Priority:** MEDIUM

#### Gathering Times Management
**Status:** ❌ Not Started
**Requirements:**
- Partners can add/edit:
  - Monthly gathering time
  - Jumu'ah times
- Store in `organizations` table:
  - `jumuahTimes: v.optional(v.string())`
  - `monthlyGatheringTime: v.optional(v.string())`
- Display on partner landing page (`/[slug]`)
- Display to seekers once paired

**Priority:** MEDIUM

---

### 4. Event Enablement Features

#### Bulk Email System
**Status:** ❌ Not Started (Part of Community Overview Tab)
**Requirements:**
- Select all or individual selection
- Send bulk email to:
  - All seekers in community
  - All ansars in community
  - Selected subset
- Simple email composer
- Uses Resend API
- Logged to messages table

**Priority:** HIGH (Core value prop)

---

## 📋 IMPLEMENTATION PRIORITY

### Phase 1: Critical for Launch (Week 1)
1. ✅ Notifications system (DONE)
2. ❌ New Muslim Resources Page (`/resources/new-muslim`)
3. ❌ Community Overview Tab (Partner Dashboard)
4. ❌ Bulk Email functionality

### Phase 2: Training & Activation (Week 2)
5. ❌ Ansar Training System
6. ❌ Update Ansar terminology ("Apply to be Ansar")
7. ❌ Training completion tracking

### Phase 3: Community Features (Week 3)
8. ❌ Gathering Times Management
9. ❌ Partner Directory (public)
10. ❌ Event Setup Toolkit

---

## 🎯 VALUE PROPOSITIONS (Confirmed)

### For Seekers
- ✅ "You're not alone" messaging
- ✅ Immediate welcome + resources
- ❌ Clear framing: videos ≠ entire religion
- ❌ Connection to real local community

### For Ansars
- ✅ Application process
- ❌ Clear expectations: presence > mentoring
- ❌ Training system
- ❌ Activation workflow

### For Partners
- ✅ Application + approval workflow
- ✅ Dashboard with pairing
- ❌ "We put you on the map" messaging
- ❌ Community Overview (visibility)
- ❌ Event enablement tools
- ❌ Bulk communication

---

## 📝 NOTES

- All notifications are working and logged
- Database schema supports all features
- Need to add gathering times fields to organizations table
- Training system needs new status field or completion tracking
- Bulk email needs UI in Partner Dashboard
