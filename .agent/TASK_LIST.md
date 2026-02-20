# Ansar Family — Implementation Task List
**Version:** 2.1 Upgrade PRD + Meeting Notes (Feb 2026)
**Purpose:** AI-tool-friendly task list for development. Use this as your ground truth.
**Legend:** ✅ Already Built | 🔲 Not Yet Built | ⚠️ Partially Built / Needs Fix

---

## CONTEXT FOR AI TOOLS

This is a Next.js 16.1.2 app with TypeScript, Convex (real-time backend), Clerk (auth), and Vercel hosting.
Design system uses Tailwind with custom tokens: `ansar-sage`, `ansar-terracotta`, `ansar-ochre`, `ansar-cream`, `ansar-charcoal`.
Typography: EB Garamond (`font-heading`), JetBrains Mono (`font-body`).
All Convex functions live in `/convex/`. All pages in `/src/app/`.
Do not remove or replace anything already built. All tasks below are additive.

---

## SECTION 1 — SECURITY FIXES (DO FIRST — CRITICAL)

### 1.1 Google OAuth Role Bypass — Verification Checkpoint
**Status:** ✅ Fixed (Feb 19, 2026)
**What was fixed:** Role-based access control now applies to ALL sign-in methods (Google OAuth + email/password).
**Implementation details:**
- `middleware.ts`: Full role-based route enforcement reading `sessionClaims.metadata.role`
- `src/app/api/auth/sync-role/route.ts`: NEW — bridges Convex role → Clerk publicMetadata
- `src/app/api/auth/create-account/route.ts`: Sets role in publicMetadata on user creation
- `src/app/dashboard/page.tsx`: Auto-syncs role to Clerk on first login via gateway
- `types/globals.d.ts`: NEW — TypeScript declarations for custom session claims
- Clerk production session token customized with `{"metadata": "{{user.public_metadata}}"}`

**Verification checklist — run through this before next partner demo:**
- [ ] Sign in via Google with an account that has NO assigned Clerk role → should be blocked from `/admin` and all dashboards
- [ ] Sign in via Google as a `partner_lead` → should land on `/dashboard/[slug]` only, cannot access `/admin`
- [ ] Sign in via Google as a `super_admin` → should access `/admin` correctly
- [ ] Sign in via Google as an `ansar` → should land on `/ansar/dashboard` only
- [ ] Confirm no role = no dashboard access, redirects to a friendly page (not a raw error)
**Files to spot-check:** `middleware.ts`, `src/app/admin/page.tsx`, any `useUser()` role checks.

---

## SECTION 2 — FEMALE SEEKER DATA PROTECTION (DO SECOND — SAFETY CRITICAL)

### 2.1 Add Gender Field to Seeker Intake Form
**Status:** ⚠️ Partially Built — gender field may exist on Partner form but not confirmed on Seeker intake
**Task:** Ensure the Seeker intake form (`/join` and `/[slug]/join`) includes a required gender field: Brothers / Sisters.
**Schema change:** Add `gender: v.union(v.literal("male"), v.literal("female"), v.literal("prefer_not_to_say"))` to the `intakes` table in `convex/schema.ts`.
**Files:** `convex/schema.ts`, `src/app/join/page.tsx`, `src/app/[slug]/join/page.tsx`

### 2.2 Hide Female Contact Data from Partner Dashboard
**Status:** 🔲 Not Built
**Task:** In the Partner Dashboard Seekers/Contacts view, if a seeker's `gender === "female"`, all personal contact details (phone, email, address) must be hidden/blurred.
**Rule:** Contact data for female seekers is only visible to: (a) Super Admins, and (b) validated Sister Admins within the same org.
**Files:** `src/app/dashboard/[slug]/page.tsx`, any Seeker card/list components.
**UI:** Show a lock icon with the text "Contact visible to Sister Admin only" where the contact fields would otherwise appear.

### 2.3 Create Sister Admin Role
**Status:** 🔲 Not Built
**Task:** Add a `sister_admin` role to Clerk's role system. A Sister Admin belongs to a specific org (Partner Hub) and has access only to female seeker contact data within their org.
**Files:** Clerk dashboard configuration, `convex/users.ts` (add role), `convex/schema.ts` users table.
**Behavior:** When a Sister Admin logs in, they see the standard Partner Dashboard but with female contacts visible and male contacts hidden (inverse of the Partner Lead view).

### 2.4 Conditional Partner Onboarding — Sister Admin Requirement
**Status:** 🔲 Not Built
**Task:** During partner approval in the Super Admin dashboard, surface a notice: "This partner has not yet designated a Sister Admin. Female seeker contacts will be hidden until one is confirmed."
**No blocker:** Partners can be approved without a Sister Admin, but the limitation is clearly communicated.
**Files:** `src/app/admin/page.tsx`, Partner approval flow.

### 2.5 Gender-Based Pairing Enforcement
**Status:** 🔲 Not Built
**Task:** In the pairing creation flow (Partner Dashboard), enforce that Ansars can only be paired with Seekers of the same gender. The UI should filter available Ansars to only show same-gender options when a Seeker is selected.
**Files:** `src/app/dashboard/[slug]/page.tsx`, pairing modal component, `convex/pairings.ts`.

---

## SECTION 3 — SEEKER PORTAL / DASHBOARD

### 3.1 Seeker Dashboard Route
**Status:** ✅ Built — verify on next prompt run
**Route:** `/seeker/dashboard`
**Auth:** Clerk protected, seeker role.
**Verification:** Confirm `seekerClerkId` is linked to the `intakes` table so the correct record loads on login.

### 3.2 Seeker Dashboard — Home Tab
**Status:** ✅ Built — verify on next prompt run
**Verification:** Confirm welcome message is personalized with the seeker's name and next step prompt reflects their actual journey stage.

### 3.3 Seeker Dashboard — My Journey Tab (5-Stage Tracker)
**Status:** ✅ Built — verify on next prompt run
**Expected stages:**
1. Good Company (paired with Ansar and community)
2. Community (attending events)
3. Daily Prayers (establishing Salah)
4. Knowledge (learning modules complete)
5. (Stage 5 — placeholder)
**Verification:** Confirm stages are derived from structured data (pairing status, video completion), not raw status strings shown to the user. Confirm task checklist is present per stage.

### 3.4 Seeker Dashboard — Messages Tab
**Status:** ✅ Built — verify on next prompt run
**Verification:** Confirm message thread with paired Ansar loads correctly and sends/receives in real time via Convex.

### 3.5 Seeker Dashboard — Learn Tab
**Status:** ✅ Built — verify on next prompt run
**Verification:** Confirm the 4 foundational videos appear as defaults. Confirm Partner-assigned content also surfaces here when present.

### 3.6 Seeker Dashboard — Support Tab
**Status:** ✅ Built — verify on next prompt run
**Verification:** Confirm CARE hotline link is present. Confirm contact form routes to Partner Lead or Core Team correctly.

### 3.7 Seeker Dashboard — First-Login Tutorial
**Status:** 🔲 Not Built — placeholder needed
**Task:** On first login, show a tooltip/walkthrough tour highlighting each tab. Dismissible. Re-launchable via a "?" icon in the nav.
**Scope for now:** Build the placeholder structure and trigger logic. Full copy and tooltip content can be filled in after verification pass.
**Library suggestion:** `react-joyride` or a lightweight custom state-machine tour.
**Files:** `src/app/seeker/dashboard/page.tsx`, new `src/components/SeekerTour.tsx`.

### 3.8 Seeker Dashboard — Floating Chat Bubble (Ansar Messaging)
**Status:** 🔲 Not Built
**Task:** Add an on-brand floating chat bubble in the bottom-right corner of the Seeker dashboard.
**Files to create:** `src/components/SeekerChatBubble.tsx`
**Wires into:** existing `convex/messages.ts`

---

## SECTION 4 — ANSAR DASHBOARD

### 4.1 Ansar Dashboard Route
**Status:** ✅ Built — verify on next prompt run
**Route:** `/ansar/dashboard`
**Auth:** Clerk protected, ansar role.

### 4.2 Ansar Dashboard — Overview Tab
**Status:** ✅ Built — verify on next prompt run

### 4.3 Ansar Dashboard — Inbox / Messages Tab
**Status:** ✅ Built — verify on next prompt run

### 4.4 Ansar Dashboard — Seekers Tab
**Status:** ✅ Built — verify on next prompt run

### 4.5 Ansar Dashboard — My Profile Tab
**Status:** ✅ Built — verify on next prompt run

### 4.6 Ansar Dashboard — First-Login Tutorial
**Status:** 🔲 Not Built — placeholder needed

### 4.7 Ansar Check-In Reminder Onboarding Prompt
**Status:** 🔲 Not Built

### 4.8 Ansar Dashboard — Floating Chat Window (Seeker Messaging)
**Status:** 🔲 Not Built
**Files to create:** `src/components/AnsarChatWindow.tsx`

---

## SECTION 5 — PARTNER DASHBOARD UPGRADES

### 5.1 Unmatched Seekers Tab
**Status:** ⚠️ Partially Built

### 5.2 Partner Dashboard — Custom Task Assignment to Seekers
**Status:** 🔲 Not Built

### 5.3 Partner Dashboard — Events Table
**Status:** 🔲 Not Built

---

## SECTION 6 — HOMEPAGE & ENTRY POINT UPGRADES

### 6.1 Homepage — Three Clear CTAs Above the Fold
**Status:** ✅ Already Built

### 6.2 Homepage — Muted Autoplay Background Video
**Status:** 🔲 Not Built

### 6.3 Homepage — Explanatory Video Panel (Below the Fold)
**Status:** 🔲 Not Built

### 6.4 Homepage — Universal Login Button (Top Right)
**Status:** ✅ Fixed (Feb 19, 2026)
**What was done:**
- Header: "Partner Login" → "Sign In" pointing to `/dashboard` (gateway auto-routes by role)
- Footer: "Admin" link removed entirely
- Role-based routing: super_admin→/admin, partner_lead→/dashboard/[slug], ansar→/ansar, seeker→/seeker

### 6.5 Seeker Entry — "Join the Community" Path Split
**Status:** 🔲 Not Built

### 6.6 Organic Ansar Recruitment — Opt-In Checkbox
**Status:** 🔲 Not Built

---

## SECTION 7 — SMS NOTIFICATIONS

### 7.1 Audit Existing Twilio Setup
**Status:** ⚠️ Scaffolded but not operational

### 7.2–7.5 SMS Triggers
**Status:** 🔲 Not Built

---

## SECTION 8 — CONTENT & VIDEO

### 8.1–8.4 Content Tasks
**Status:** 🔲 Not Built

---

## SECTION 9 — PARTNER HUB PUBLIC WEBSITE
**Requires Abdul Kareem Approval before development**
### 9.1–9.4 All tasks
**Status:** 🔲 Not Built

---

## SECTION 10 — LLM INTEGRATION
**Requires Abdul Kareem Approval before development**
### 10.1–10.4 All tasks
**Status:** 🔲 Not Built

---

## RECOMMENDED BUILD ORDER

| Priority | Task | Complexity | Approval Needed | Status |
|---|---|---|---|---|
| 🔴 1 | 1.1 — Fix Google OAuth role bypass | Low | No | ✅ Done |
| 🔴 2 | 2.1–2.5 — Female seeker data protection | Medium | No | 🔲 Next |
| 🟡 3 | 8.1 — Publish 4 videos to Seeker portal | Low | No | 🔲 |
| 🟡 4 | 5.1 — Unmatched Seekers tab in Partner Dashboard | Low | No | ⚠️ |
| 🟡 5 | 6.4 — Universal login routing | Low | No | ✅ Done |
| 🟡 6 | 7.1–7.2 — Twilio audit + form submission SMS | Low | No | 🔲 |
| 🟠 7 | 3.1–3.7 — Full Seeker Dashboard | Medium | No | ✅ Verify |
| 🟠 8 | 4.1–4.7 — Full Ansar Dashboard | Medium | No | ✅ Verify |
| 🟠 9 | 6.5–6.6 — Seeker entry path split + Ansar opt-in | Low | No | 🔲 |
| 🟠 10 | 7.3–7.5 — Remaining SMS triggers | Low | No | 🔲 |
| 🟠 11 | 5.2–5.3 — Custom tasks + Events schema | Medium | No | 🔲 |
| 🔵 12 | 9.1–9.4 — Partner Hub public website | Medium | **Yes** | 🔲 |
| 🔵 13 | 10.1–10.4 — LLM integration (all use cases) | High | **Yes** | 🔲 |

*Last updated: February 19, 2026*
