# Ansar Family Platform — Feature Feasibility Analysis

**Based on Stakeholder Meeting Requirements | February 2026**

---

## Executive Summary

I audited the entire Ansar Family codebase (Next.js 16, Convex backend, Clerk auth, Twilio SMS, Resend email) against all 9 requirements from the meeting. **6 of the 9 items can be fully implemented** within the existing codebase. 2 require external decisions beyond code. 1 (LLM monitoring) needs to be phased across multiple iterations.

---

## At-a-Glance Summary

| # | Requirement | Status | Effort |
|---|-------------|--------|--------|
| P1 | Google Sign-In Access Fix | ✅ Can Implement | 1–2 days |
| P2 | Female Seeker Data Protection | ✅ Can Implement | 3–4 days |
| P3 | Publish Videos + Seeker Portal | ✅ Can Implement | 1–2 days |
| P4 | Homepage Redesign (3 CTAs) | ✅ Can Implement | 3–5 days |
| P5 | My Journey Redesign | ✅ Can Implement | 4–6 days |
| P6 | Dashboard Tutorial Tours | ✅ Can Implement | 3–4 days |
| P7 | Sister Admin Role | ✅ Can Implement | 2–3 days |
| P8 | Partful / Event SMS Integration | 🔵 Requires External Decision | 2–3 days |
| P9 | LLM Conversation Monitoring | 🟡 Partially (Phased) | 2–4 weeks |

---

## Detailed Analysis by Requirement

### P1. Google Sign-In Access Control Fix

**Priority:** CRITICAL (do this now)
**Status:** Can implement immediately
**Effort:** 1–2 days

**What I found:** The current `middleware.ts` uses Clerk's `auth.protect()` which only checks if a user is *authenticated*, not their *role*. This means any Google-authenticated user can access `/admin` routes. The Convex backend does role checks in some queries, but the Next.js route layer does not enforce roles.

**What needs to change:**

- Update `middleware.ts` to check the user's role from Clerk metadata before allowing access to `/admin`, `/dashboard`, `/seeker`, and `/ansar` routes.
- Set `publicMetadata.role` in Clerk when users are created (the `create-account` API route already creates Clerk users but doesn't set metadata).
- Add server-side role verification on each dashboard page component as a second layer of defense.
- Add a redirect for unauthorized access attempts (e.g., show "Access Denied" or redirect to home).

No schema changes needed — straightforward Clerk middleware enhancement.

---

### P2. Female Seeker Data Protection

**Priority:** URGENT (before partner onboarding)
**Status:** Can implement fully
**Effort:** 3–4 days

**What I found:** The `gender` field already exists on both the `intakes` and `ansars` tables (male/female enum). The partner dashboard's Seekers tab currently shows all contact details (phone, email, address) to all `partner_lead` users regardless of seeker gender. There is no "Sister Admin" role in the current schema.

**What needs to change:**

- Add a `sister_admin` role to the `users` table's role union (Convex schema migration).
- Add a `sisterAdminId` optional field to the `organizations` table so each hub can designate their Sister Admin.
- Modify the Convex queries for intakes (`listAll`, `getByOrganization`) to accept the requesting user's role and redact phone/email/address for female seekers if the requester is a `partner_lead` (not a `sister_admin` or `super_admin`).
- Update the Partner Dashboard's Seekers tab and `DetailPanel` component to show blurred/hidden fields when data is redacted.
- Add a notice banner on the Partner Dashboard: *"You will not have visibility into female seeker contacts until a Sister Admin is designated."*

Architecture supports this cleanly — gender data is already captured, so no intake form changes needed.

---

### P3. Publish Videos + Connect to Seeker Portal

**Priority:** HIGH (needed for demos)
**Status:** Can implement immediately
**Effort:** 1–2 days

**What I found:** The Seeker Portal already has a hardcoded video carousel with 5 placeholder YouTube videos. The `hub_resources` table supports video content with YouTube ID extraction and thumbnail generation. Partner admins can already add YouTube links visible to all their seekers or specific individuals.

**What needs to change:**

- Replace the 5 hardcoded video IDs in the Seeker Portal with the actual Wudu/basics video IDs once Brother Uzi's edits are finalized.
- Create a "default resources" system: when a new Seeker signs up, auto-assign the 4 foundational videos as `hub_resources` (a small Convex mutation triggered on intake creation).
- Waswaas/OCD video is a content team dependency, not code.
- Partner admin's ability to add YouTube links is already built — no changes needed.

Mostly a content swap plus one small auto-assignment mutation.

---

### P4. Homepage Redesign with 3 CTAs + Video

**Priority:** HIGH
**Status:** Can implement fully
**Effort:** 3–5 days

**What I found:** The current homepage already has three CTA paths (Seeker, Ansar, Partner) with a hero section, mission section, and ecosystem section. Uses Framer Motion for animations and includes a decorative garden SVG animation. No background video or Sheikh explainer video section currently.

**What needs to change:**

- Redesign the hero section: add a muted autoplay background video (`<video>` tag with `autoPlay`, `muted`, `loop`, `playsInline`). Add a click-to-unmute toggle.
- Replace the current three separate card sections with a unified "shelter/house" visual container nesting Seeker and Ansar within a Partner/Community outer wrapper.
- Ensure the 3 CTAs are prominent above the fold: "Join the Community" → `/join`, "Become an Ansar" → `/volunteer`, "Register Your Community" → `/partner`.
- Add a below-the-fold video panel with a YouTube embed (Sheikh explainer) and smooth scroll anchor from a "Learn More" link.
- Add a universal login button in the top-right corner that routes users to the correct dashboard based on their role.

I'll need the actual background video file and the Sheikh's explainer video URL from you.

---

### P5. My Journey Redesign (Task-Based Flow)

**Priority:** HIGH
**Status:** Can implement fully
**Effort:** 4–6 days

**What I found:** The Seeker Portal's "My Journey" tab currently shows a linear status tracker (form submitted → paired). It displays the seeker's pairing status and assigned Ansar info. No task/milestone system, no journey stages, no "How did you come to Islam?" field.

**What needs to change:**

- **New Convex table:** Add a `journey_tasks` table with fields for `seekerId`, `title`, `description`, `type` (video/attendance/custom), `stage` (1–5 for journey stages), `isCompleted`, `assignedBy` (partner or system), and `targetType` (universal vs individual).
- Replace the status tracker UI with a 5-stage journey view: Good Company → Community → Daily Prayers → Knowledge → (5th TBD). Each stage contains its checklist tasks.
- Auto-populate default tasks for new seekers: "Watch Video 1: Wudu", "Watch Video 2", etc., plus "Attend Jumu'ah."
- Add partner-facing task assignment UI in the Partner Dashboard: ability to create universal tasks (all seekers) or individual tasks (specific seeker).
- Add two new optional fields to the `intakes` schema: `revertStory` (text, "How did you come to Islam?") and `referralSource` ("How did you hear about Ansar Family?").

Most significant feature but cleanly additive — doesn't conflict with anything existing. The new `journey_tasks` table plugs into the existing organization-scoped architecture seamlessly.

---

### P6. Dashboard Tutorial / Onboarding Tours

**Priority:** MEDIUM
**Status:** Can implement fully
**Effort:** 3–4 days

**What I found:** None of the three dashboards (Partner, Ansar, Seeker) have any onboarding tour or tooltip walkthrough.

**What needs to change:**

- Integrate a React-based tour library (e.g., `react-joyride` or `driver.js`). Both work well with Next.js, no backend changes needed.
- Define tour steps for each dashboard type: Partner (7 tabs), Ansar (4 sections), Seeker (5 tabs). Each step targets a specific UI element with a tooltip explanation.
- Track tour completion in the `users` table (add a `hasCompletedTour` boolean) so it only shows on first login.
- Add a "?" or "How to use" link in each dashboard's sidebar/nav to re-trigger the tour.

Pure frontend feature with a tiny schema addition.

---

### P7. Sister Admin Role + Conditional Onboarding

**Priority:** MEDIUM
**Status:** Can implement fully
**Effort:** 2–3 days

**What I found:** The current role system has 4 roles: `super_admin`, `partner_lead`, `ansar`, `seeker`. No sub-role concept. Organizations don't track a designated Sister Admin.

**What needs to change:**

- Add `sister_admin` to the user role union in the schema. Sister Admins get `partner_lead`-level access to their organization plus visibility into female seeker data.
- Add `sisterAdminDesignated` boolean (and optional `sisterAdminUserId`) to the `organizations` table.
- Add a Sister Admin invitation/designation flow in the Partner Dashboard settings or the Super Admin approval flow.
- Show the conditional notice during partner onboarding when no Sister Admin is designated.

This ties directly into P2 (Female Seeker Data Protection) and should be implemented together.

---

### P8. Partful / Event SMS Integration

**Priority:** LOWER
**Status:** Requires external decision
**Effort:** 2–3 days (after platform selection)

**What I found:** The platform already has an `events` table and event creation UI in the Partner Dashboard. Events have title, description, date, time, location, and organization scoping. Currently no event-specific SMS invitation system — events are displayed in-app only.

**What needs to change:**

- **Decision needed:** Which event platform? Partful, Eventbrite, Luma, or another? Each has different API capabilities and pricing.
- Once selected, integrate their API for event creation from the Partner Dashboard. The existing events table can store the external event ID for reference.
- The event platform handles SMS invitations natively, so no Twilio build is needed.
- For Ansar check-in reminders: add a UX prompt during Ansar onboarding that guides them to set a personal phone reminder. Simple UI addition to the volunteer form confirmation page.

---

### P9. LLM Conversation Monitoring & Journey Analysis

**Priority:** PHASED (backend work)
**Status:** Partially implementable — needs phased approach
**Effort:** 2–4 weeks across multiple phases

**What I found:** The in-app messaging system is fully built (`conversations`, `conversation_participants`, `conversation_messages` tables). Messages are stored as plain text. No LLM integration, no safety flagging, no conversation analysis, and no gender-based pairing enforcement at the architectural level.

#### Phase 1 — Gender Separation Enforcement (1–2 days)

- Add validation to `pairings.create()` mutation: reject pairings where seeker and ansar genders don't match. Simple check since both `intakes` and `ansars` already store gender.
- Add validation to the messaging system: prevent direct message creation between users of different genders.

#### Phase 2 — Safety Flagging (3–5 days)

- Create a Convex action that sends conversation messages to the Anthropic Claude API for content analysis after each message is sent.
- Define safety categories: solicitation, boundary violations, inappropriate content, crisis indicators.
- On detection: create a `safety_flags` table entry with the flag type, a sanitized summary (no raw conversation text), severity level, and the affected conversation ID.
- Send an in-app notification to Super Admin with the flag summary. Send an automated warning message to the offending user.

#### Phase 3 — Journey Analysis & Ansar Quality Scoring (1–2 weeks)

- Scheduled Convex action (weekly or on-demand) analyzing conversation patterns and video completion per seeker.
- LLM determines journey stage (1–5) based on conversation content and task completion. Stored as a computed field visible to Super Admin only.
- Ansar engagement scoring: analyze message frequency, response times, conversation tone. Surface low-engagement pairs for review.
- Build a Super Admin analytics view showing journey stage distribution, at-risk pairs, and Ansar quality metrics.

**Key note:** The Anthropic Claude API will need an API key configured as a Convex environment variable. The "no human reads raw conversations" rule means the `safety_flags` table stores only summaries, never raw message text.

---

## Communications Strategy: Twilio Removal

- The Twilio integration currently handles welcome SMS for seekers, ansars, partners, contacts, and pairing notifications (~200 lines in `notifications.ts`).
- **Recommendation:** Keep the Twilio code in place but wrap it behind a feature flag (environment variable). SMS can be re-enabled per-environment without code changes if the team revisits it.
- Resend (email) stays fully active. All critical notifications already have email equivalents.
- The `messages` audit log table continues to work for email tracking regardless of Twilio status.

---

## Recommended Sprint Order

| Sprint | Features | Duration | Why First |
|--------|----------|----------|-----------|
| Sprint 1 | P1 (Auth Fix) + P2/P7 (Female Protection + Sister Admin) | 5–7 days | Security + Safety |
| Sprint 2 | P3 (Videos) + P4 (Homepage Redesign) | 4–6 days | Demo-ready |
| Sprint 3 | P5 (My Journey) + P6 (Dashboard Tours) | 5–8 days | UX Polish |
| Sprint 4 | P8 (Event Platform) + P9 Phase 1 (Gender Enforcement) | 3–5 days | Safety Layer |
| Sprint 5 | P9 Phases 2–3 (LLM Monitoring) | 1–2 weeks | Advanced |

---

## What I Need From You to Start

- The 4 finalized Wudu video YouTube URLs (for P3)
- Background video file for the homepage hero section (for P4)
- Sheikh explainer video YouTube URL (for P4)
- The 5th journey stage name, if decided (for P5)
- Event platform decision: Partful or alternative? (for P8)
- Anthropic API key for Claude integration (for P9)
- Confirmation on which items to begin with (I recommend Sprint 1: Auth Fix + Female Protection)

---

*Ready to start implementing whenever you give the green light. Just let me know which sprint to begin with.*
