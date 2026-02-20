# Ansar Platform — Implementation Plan (Validated Against Codebase)

> Generated: 2026-02-19
> Validated against: Next.js 16 + Convex + Clerk + Tailwind 4 + Framer Motion

---

## Codebase Architecture Snapshot

| Layer | Tech | Key Files |
|-------|------|-----------|
| **Frontend** | Next.js 16, React 19, Tailwind 4, Framer Motion | `src/app/page.tsx` (homepage, 695 lines), `src/app/seeker/page.tsx` (1288 lines), `src/app/admin/page.tsx` (111KB), `src/app/dashboard/[slug]/page.tsx`, `src/app/ansar/page.tsx` |
| **Backend** | Convex | `convex/schema.ts` (441 lines, 12 tables), `convex/intakes.ts`, `convex/pairings.ts`, `convex/users.ts`, `convex/notifications.ts` (79KB) |
| **Auth** | Clerk v6.36 | `middleware.ts` (39 lines — **auth.protect() only, NO role checking**) |
| **Messaging** | In-app (Convex) | `convex/inbox.ts` (19KB), `conversations` + `conversation_participants` + `conversation_messages` tables |
| **Notifications** | Resend (email), Twilio (SMS) | `convex/notifications.ts` |
| **Components** | `src/components/crm/` (9 files), `src/components/messaging/` (5 files), `GardenAnimation.tsx` |

### Current Schema: 12 tables
`users` · `intakes` · `ansars` · `partners` · `organizations` · `pairings` · `messages` · `conversations` · `conversation_participants` · `conversation_messages` · `events` · `hub_resources` · `contacts`

### Current User Roles (users.role union):
`super_admin` | `partner_lead` | `ansar` | `seeker`

---

## Sprint 1: Security & Safety First (5–7 days)

### P1. Google Sign-In Access Control Fix
**Priority:** 🔴 CRITICAL | **Effort:** 1–2 days

**Validated findings:**
- ✅ `middleware.ts` line 27: `await auth.protect()` — **authentication only, zero role checking**
- ✅ Route matchers for `/admin(.*)`, `/dashboard(.*)`, `/seeker(.*)`, `/ansar(.*)` exist but only gate on login
- ✅ `convex/users.ts` → `upsertFromClerk()` auto-detects role from existing intake/ansar/partner records but **does NOT set Clerk metadata**
- ✅ Seeker portal (line 149) has client-side role check: `if (currentUser.role !== "seeker")` — but this is bypassable

**Implementation:**
1. **`middleware.ts`** — Replace `auth.protect()` with role-based routing:
   - Fetch `sessionClaims.metadata.role` from Clerk
   - `/admin/*` → only `super_admin`
   - `/dashboard/*` → only `partner_lead` and `super_admin`
   - `/seeker/*` → only `seeker`
   - `/ansar/*` → only `ansar`
   - Redirect unauthorized users to `/` or an "unauthorized" page

2. **`convex/users.ts` → `upsertFromClerk()`** — After detecting/setting role, call Clerk's backend API to set `publicMetadata.role` on the Clerk user so middleware can read it from JWT claims

3. **`src/app/api/`** — Create API route for Clerk webhook to sync role changes

4. **Each dashboard page** — Keep client-side role checks as second defense layer (already exists in seeker, needs adding to admin/dashboard)

**Schema changes:** None
**Files affected:** `middleware.ts`, `convex/users.ts`, `src/app/api/` (new)

---

### P2 + P7. Female Seeker Data Protection + Sister Admin Role
**Priority:** 🔴 URGENT | **Effort:** 5–7 days (combined)

**Validated findings:**
- ✅ `intakes.gender` exists (line 48): `v.union(v.literal("male"), v.literal("female"))`
- ✅ `ansars.gender` exists (line 96): same enum
- ✅ `intakes.listByOrganization` (line 289) returns **ALL fields** including phone, email, address — no role-based redaction
- ✅ `organizations` table (line 245) has **NO** sister admin fields
- ✅ Current role union (line 27-32): `super_admin | partner_lead | ansar | seeker` — no `sister_admin`

**Implementation:**

**Schema changes (convex/schema.ts):**
```
- users.role: add v.literal("sister_admin")
- users: add hasCompletedTour: v.optional(v.boolean()) // for P6
- organizations: add sisterAdminDesignated: v.optional(v.boolean())
- organizations: add sisterAdminUserId: v.optional(v.id("users"))
```

**Backend (convex/):**
1. `convex/intakes.ts` → New query `listByOrganizationWithRedaction`:
   - Accept `requestingUserRole` arg
   - If `partner_lead` + seeker is female → redact phone, email, address (return `"[Protected]"`)
   - If `sister_admin` or `super_admin` → return full data
2. `convex/users.ts` → Update all role unions to include `sister_admin`
3. `convex/organizations.ts` → Add mutation to designate Sister Admin

**Frontend:**
1. Partner Dashboard Seekers tab → Use redacted query, show blurred UI for protected fields
2. Notice banner when no Sister Admin designated
3. Partner Dashboard Settings → Sister Admin invitation flow

**Files affected:** `convex/schema.ts`, `convex/intakes.ts`, `convex/users.ts`, `convex/organizations.ts`, `src/app/dashboard/[slug]/page.tsx`, `src/app/admin/page.tsx`

---

## Sprint 2: Demo-Ready (4–6 days)

### P3. Publish Videos + Connect to Seeker Portal
**Priority:** 🟡 HIGH | **Effort:** 1–2 days

**Validated findings:**
- ✅ `src/app/seeker/page.tsx` line 33-39: **5 hardcoded placeholder YouTube videos** with comment "swap YouTube IDs later"
- ✅ `hub_resources` table fully supports videos with `videoId`, `thumbnailUrl`, `targetType` ("all" | "specific")
- ✅ Partner admin can already create hub_resources — functionality built
- ✅ Seeker portal merges `hubVideos` + `ONBOARDING_VIDEOS` on lines 262-270 and 736-745

**Implementation:**
1. Replace 5 placeholder YouTube IDs in `ONBOARDING_VIDEOS` array with actual Wudu/basics video IDs (need from client)
2. Create `convex/intakes.ts` → Add post-intake auto-assignment: after creating a new intake linked to an org, insert 4 foundational `hub_resources` entries tagged to that seeker
3. Optional: Make `ONBOARDING_VIDEOS` a Convex query so they can be managed from admin

**Schema changes:** None
**Files affected:** `src/app/seeker/page.tsx` (line 33-39 swap), `convex/intakes.ts` (small addition to create handler)
**Blocked on:** Final video URLs from client

---

### P4. Homepage Redesign with 3 CTAs + Video
**Priority:** 🟡 HIGH | **Effort:** 3–5 days

**Validated findings:**
- ✅ Current homepage (695 lines): Hero with watercolor bg image + GardenAnimation, 2 CTA cards (Seeker + Ansar), Partner CTA in header only
- ✅ No background video currently — uses `hero-watercolor-bg.png` Image component
- ✅ 3 CTAs exist but scattered: Seeker card, Ansar card (hero), Partner button (header)
- ✅ Footer has sign-in link at `/admin`
- ✅ No explainer video section
- ✅ Framer Motion already imported and used extensively

**Implementation:**
1. **Hero section** — Replace watercolor Image with muted HTML5 `<video>` tag:
   ```tsx
   <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
     <source src="/videos/hero-bg.mp4" type="video/mp4" />
   </video>
   ```
   Add click-to-unmute toggle button

2. **3 CTAs above the fold** — Bring Partner CTA from header into hero as a 3rd card alongside Seeker + Ansar

3. **Unified "shelter" visual container** — Wrap Seeker/Ansar cards inside a "Community" outer wrapper showing the nesting concept

4. **Below-fold explainer video panel** — New section with YouTube embed + smooth scroll anchor from header

5. **Universal login button** — Replace "Partner Login" in header with generic "Sign In" that uses role-based redirect from P1

**Schema changes:** None
**Files affected:** `src/app/page.tsx` (major rewrite), `public/videos/` (new video asset)
**Blocked on:** Background video file + Sheikh explainer video URL from client
**Design skill:** Use `ui-ux-pro-max` → `--design-system "community nonprofit platform"` for color/typography guidance

---

## Sprint 3: UX Polish (5–8 days)

### P5. My Journey Redesign (Task-Based Flow)
**Priority:** 🟡 HIGH | **Effort:** 4–6 days

**Validated findings:**
- ✅ Current JourneyTab (line 640-726): **3-step linear tracker only** — "Form Submitted" → "Community Matched" → "Paired with Ansar"
- ✅ Each step just checks `status` field — no task/milestone tracking
- ✅ No "How did you come to Islam?" field on intake form
- ✅ No journey stages concept
- ✅ `hub_resources` already supports individual targeting (`targetType: "specific"`, `targetSeekerId`)

**Implementation:**

**New schema table:**
```
journey_tasks: {
  seekerId: v.id("intakes"),
  title: v.string(),
  description: v.optional(v.string()),
  type: v.union(v.literal("video"), v.literal("attendance"), v.literal("custom")),
  stage: v.number(), // 1–5
  isCompleted: v.boolean(),
  completedAt: v.optional(v.number()),
  assignedBy: v.optional(v.id("users")),
  targetType: v.union(v.literal("universal"), v.literal("individual")),
  organizationId: v.id("organizations"),
}
```

**Intake schema additions:**
```
intakes: {
  ...existing,
  revertStory: v.optional(v.string()),
  referralSource: v.optional(v.string()),
}
```

**5 Journey Stages:**
1. Good Company (Suhba)
2. Community (Jumu'ah attendance)
3. Daily Prayers
4. Knowledge
5. (5th TBD — client to decide)

**Backend:** New `convex/journeyTasks.ts` with CRUD + auto-population on intake creation
**Frontend:** Replace 3-step tracker in `src/app/seeker/page.tsx` with 5-stage visual journey. Add partner-facing task assignment UI in dashboard.

---

### P6. Dashboard Tutorial / Onboarding Tours
**Priority:** 🟢 MEDIUM | **Effort:** 3–4 days

**Validated findings:**
- ✅ No tour library installed — `package.json` has no joyride/driver.js
- ✅ No `hasCompletedTour` field on users table
- ✅ Three dashboards: Seeker (5 tabs), Partner Dashboard (7 tabs — in `dashboard/[slug]/page.tsx`), Admin (`admin/page.tsx`), Ansar (`ansar/page.tsx` with 4 sections)

**Implementation:**
1. Install `driver.js` (lightweight, 5KB, no React dependency issues)
2. Define tour steps JSON for each dashboard
3. `convex/schema.ts` → Add `hasCompletedTour: v.optional(v.boolean())` to users (already noted in P2 schema changes)
4. Add "?" help button in each dashboard nav
5. Auto-trigger on first login when `hasCompletedTour !== true`

**Files affected:** `package.json`, `src/app/seeker/page.tsx`, `src/app/dashboard/[slug]/page.tsx`, `src/app/admin/page.tsx`, `src/app/ansar/page.tsx`, `convex/schema.ts`, `convex/users.ts`

---

## Sprint 4: Safety Layer (3–5 days)

### P8. Event Platform SMS Integration
**Priority:** 🔵 LOWER | **Effort:** 2–3 days (after platform selection)

**Validated findings:**
- ✅ `events` table exists with title, description, date, time, location, organizationId
- ✅ Event creation UI exists in Partner Dashboard
- ✅ Events display in Seeker Portal (lines 334-353)
- ✅ No external event platform integration
- ✅ No event-specific SMS

**Blocked on:** Client choosing event platform (Partful, Eventbrite, Luma)

---

### P9 Phase 1. Gender Separation Enforcement
**Priority:** 🟢 MEDIUM | **Effort:** 1–2 days

**Validated findings:**
- ✅ `pairings.create()` handler (line 28-138): Validates seeker exists, ansar exists, ansar is approved, no existing pairing — but **NO gender matching validation**
- ✅ Both `intakes.gender` and `ansars.gender` use the same enum — trivially comparable
- ✅ Messaging system (`convex/inbox.ts`) has no gender validation on `startConversation`

**Implementation:**
1. `convex/pairings.ts` → Add to create handler:
   ```ts
   if (seeker.gender !== ansar.gender) {
     throw new Error("Cross-gender pairings are not allowed.");
   }
   ```
2. `convex/inbox.ts` → Add gender validation to `startConversation` — look up both users' linked intake/ansar records, reject if cross-gender

---

## Sprint 5: Advanced Features (1–2 weeks)

### P9 Phases 2–3. LLM Monitoring
Deferred — requires Claude API integration, new `safety_flags` table, scheduled actions, admin analytics view.

---

## Twilio Feature Flag

**Recommendation:** Wrap all Twilio calls in `convex/notifications.ts` (79KB) behind:
```ts
const TWILIO_ENABLED = process.env.TWILIO_ENABLED === "true";
```
Keep Resend (email) fully active.

---

## Complete Schema Migration Summary

```diff
users: {
  ...existing,
+ role: add v.literal("sister_admin") to union
+ hasCompletedTour: v.optional(v.boolean())
}

organizations: {
  ...existing,
+ sisterAdminDesignated: v.optional(v.boolean())
+ sisterAdminUserId: v.optional(v.id("users"))
}

intakes: {
  ...existing,
+ revertStory: v.optional(v.string())
+ referralSource: v.optional(v.string())
}

+ journey_tasks: NEW TABLE {
    seekerId: v.id("intakes"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union("video", "attendance", "custom"),
    stage: v.number(),
    isCompleted: v.boolean(),
    completedAt: v.optional(v.number()),
    assignedBy: v.optional(v.id("users")),
    targetType: v.union("universal", "individual"),
    organizationId: v.id("organizations"),
  }
```

---

## Decision Items Needed from Client

| Item | Needed For | Priority |
|------|-----------|----------|
| Background video file (MP4) | P4 Homepage | Sprint 2 |
| Sheikh explainer video URL (YouTube) | P4 Homepage | Sprint 2 |
| 4 foundational Wudu/basics video YouTube IDs | P3 Videos | Sprint 2 |
| 5th Journey Stage name | P5 Journey | Sprint 3 |
| Event platform choice (Partful/Eventbrite/Luma) | P8 Events | Sprint 4 |

---

## Ready to Start

**Sprint 1 (P1 + P2/P7) requires zero external decisions.** We can begin immediately.

Say the word and I'll start with P1 (Auth Fix) — it's 1–2 days and closes the most critical security gap.
