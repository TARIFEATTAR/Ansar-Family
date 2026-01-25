# Ansar Family — User Journey Workflows

This document outlines the complete end-to-end flows for the three core roles in the Ansar Family ecosystem.

---

## 1. Partner Hub Onboarding
**Goal:** A community organization (Masjid/MSA) registers to become a Partner Hub.

1.  **Application**
    *   **User Action:** Visits `ansar.family/partner`.
    *   **User Action:** Fills out the "Register Your Community" form.
        *   Provides Lead Info (Name, Email, Phone).
        *   Provides Org Info (Name, Type, City).
        *   Answers Infrastructure questions (Weekly programs, Imam access, etc.).
    *   **System Action:** Creates a record in `partners` table with status `pending`.

2.  **Approval (Super Admin)**
    *   **Admin Action:** Super Admin logs in at `ansar.family/admin`.
    *   **Admin Action:** Reviews "Pending Partner Applications".
    *   **Admin Action:** Clicks "Approve & Create Hub".
    *   **System Action:**
        *   Creates a new `organizations` record with a slug (e.g., `stanford-msa`).
        *   Updates `partners` record to `approved`.
        *   Links `organizations` ID to `partners` record.

3.  **Account Access**
    *   **User Action:** Partner Lead visits `ansar.family` or `ansar.family/sign-in`.
    *   **User Action:** Signs in using the **same email** provided in the application.
    *   **System Action:**
        *   Detects email matches an approved Partner Application.
        *   Upgrades user role to `partner_lead`.
        *   Links user account to the Organization ID.
        *   Redirects user to their dashboard: `ansar.family/dashboard/stanford-msa`.

---

## 2. Ansar (Volunteer) Onboarding
**Goal:** A volunteer signs up to support new Muslims at a specific Partner Hub.

1.  **Application**
    *   **User Action:** Visits a specific hub page (e.g., `ansar.family/stanford-msa`).
    *   **User Action:** Clicks "Volunteer" or "I Want to Help".
    *   **User Action:** Fills out the specific volunteer form for that hub (`/stanford-msa/volunteer`).
        *   Provides details (Practice level, skills, availability).
    *   **System Action:** Creates a record in `ansars` table.
        *   Tagged with `organizationId` of that hub.
        *   Status set to `pending`.

2.  **Approval (Partner Lead)**
    *   **Partner Action:** Partner Lead logs into their dashboard (`ansar.family/dashboard/stanford-msa`).
    *   **Partner Action:** Sees "Pending Ansar Applications".
    *   **Partner Action:** Reviews application and clicks "Approve".
    *   **System Action:** Updates Ansar status to `approved` (Ready for pairing).

3.  **Training & Activity** (Future)
    *   Ansar receives onboarding materials (manual process for now).
    *   Ansar waits to be paired with a seeker.

---

## 3. Seeker (New Muslim) Journey
**Goal:** A new Muslim connects with a local community and gets paired with an Ansar.

1.  **Intake Connection**
    *   **User Action:** Visits a specific hub page (e.g., `ansar.family/stanford-msa`).
    *   **User Action:** Clicks "I'm New to Islam" (`/stanford-msa/join`).
    *   **User Action:** Completes the intake form (Journey type, needs, contact info).
    *   **System Action:** Creates a record in `intakes` table.
        *   Tagged with `organizationId` of that hub.
        *   Status set to `triaged` (skip "disconnected" queue).
        *   Source set to `partner_specific`.

2.  **Pairing (Partner Lead)**
    *   **Partner Action:** Partner Lead sees the new seeker in "Ready to Pair" list on dashboard.
    *   **Partner Action:** Clicks "Pair with Ansar".
    *   **System Action:** Opens modal showing *available* Ansars (filtered by gender compatibility).
    *   **Partner Action:** Selects an Ansar (e.g., "Hassan").
    *   **System Action:**
        *   Creates a `pairings` record.
        *   Updates Seeker status to `connected`.
        *   Updates Ansar status to `active`.
        *   Pairing status set to `pending_intro`.

3.  **Introduction & Support**
    *   **Partner Action:** Partner Lead sends intro text/email to both (manual step).
    *   **Partner Action:** Clicks "Mark Intro Sent" on dashboard.
    *   **System Action:** Updates pairing status to `active`.
    *   **Goal:** Seeker and Ansar begin their 90-day mentorship journey.
