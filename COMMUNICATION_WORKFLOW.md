# Ansar Family — Communication Workflow & User Journey Expectations

## Overview
This document outlines the communication touchpoints and expectations for each user type (Seekers, Ansars, Partners).

---

## 🌱 SEEKERS (New Muslims / Reconnecting)

### Current State ✅
- Website visit → "I'm New" click
- Reassurance messaging ("You're not alone")
- "Join the Family" → Short intake form
- Form submission working

### New Requirements 🆕

#### 1. **Welcome Text Message** (Immediate after signup)
**Trigger:** When seeker completes intake form
**Content:**
- Thank them for signing up
- Explain the process for getting connected to a local community
- Include links to the new Muslim page

**Implementation:**
- Use Twilio SMS API
- Send immediately after `createIntake` mutation succeeds

#### 2. **New Muslim Page** (`/new-muslim`)
**Purpose:** Provide tangible resources immediately after signup

**Content:**
- **Framing:** 
  - Videos (2-5 min each) are just to "get your feet wet"
  - "This is not Islam in its entirety"
  - "True Islam is lived with people, not just watched"
  - "We're just a brief middleman. Real growth happens in the community."
  
- **Resources:**
  - Video placeholders (2-5 min videos)
  - Emergency hotline (Y Islam's number)
  - Information about weekly Jumu'ah times and community gatherings (shown once paired)

**Implementation:**
- Simple public page, no authentication required
- Link sent in welcome text message
- Can be accessed via direct URL

---

## 🤝 ANSARS (Volunteers)

### Current State ✅
- "I Want to Help" → Ansar application form
- Form submission working

### Changes Required 🔄

#### 1. **Terminology Update**
- Change "Becoming Ansar" → **"Apply to be Ansar"**

#### 2. **Clarify Expectations** (On application page)
**Main Role = Presence:**
- Show up, be welcoming, help grow the community
- One-on-one mentoring is **occasional**, not the default
- Clarify: "Am I overcommitting? Do I need to be there every day?"
  → **Answer:** No, just show up to monthly gatherings and Jumu'ah

#### 3. **Training System** 🎓
**Workflow:**
1. Complete application → Status: "pending"
2. Admin reviews → Status: "training" (send training access)
3. Complete training (track video completion) → Status: "approved"
4. Now active as Ansar

**Training Page Requirements:**
- Simple page to track video completion
- Must watch all training videos before approval
- Track: `hasCompletedTraining: boolean`

**Main Responsibilities** (Clarify on page):
- Show up to monthly gatherings and Jumu'ah
- Notice and connect with seekers
- Flag anyone that may need support
- Occasional pairing model (if it makes sense)

---

## 🏢 PARTNER HUBS

### Current State ✅
- Partner application form
- Pairing feature working
- Dashboard with pairing functionality

### New Requirements 🆕

#### 1. **Community Overview Tab** (New tab alongside Pairing tab)
**Purpose:** High-level view of community activity

**Two Lists:**

**A. Seekers/New Muslims Connected**
- Columns: Name, Email, Status
- Simple table view

**B. Ansars**
- Columns: Name, Email, Status
- Status values: "applied" (no training) or "active" (training complete)
- Simple table view

**Bulk Email Feature:**
- Select all (or individual selection)
- Send bulk email to selected people
- Helps with community engagement
- Super lightweight, no complex CRM

#### 2. **Resource Page** (`/partner-resources`)
**Event Setup Toolkit:**
- How to set up events
- Some masjids have active communities but no tracking system
- Some places don't have any converts at all
- We provide the toolkit, they just show up and host

**Content:**
- Event setup guides
- Best practices
- Templates

#### 3. **Partner Directory** (Public-facing)
- Database of all partners visible on site
- Community shares:
  - Monthly gathering times
  - Jumu'ah times
  - These are the two main places converts can plug in

#### 4. **DAWA Training Access**
- Partners get access to DAWA training resources

---

## 📋 IMPLEMENTATION PRIORITY

### Phase 1: Critical (Before Onboarding)
1. ✅ Welcome SMS for Seekers (Twilio)
2. ✅ New Muslim Page (`/new-muslim`)
3. ✅ Update Ansar terminology ("Apply to be Ansar")
4. ✅ Clarify Ansar expectations on form

### Phase 2: Training System
1. ✅ Training page for Ansars
2. ✅ Video completion tracking
3. ✅ Update approval workflow (pending → training → approved)

### Phase 3: Partner Enhancements
1. ✅ Community Overview tab in Partner Dashboard
2. ✅ Bulk email functionality
3. ✅ Partner Resources page
4. ✅ Public Partner Directory

---

## 🔗 COMMUNICATION TOUCHPOINTS SUMMARY

| User Type | Trigger | Channel | Content |
|-----------|---------|---------|---------|
| **Seeker** | Form submission | SMS | Welcome + New Muslim page link |
| **Ansar** | Application submitted | Email | Application received, training access (after review) |
| **Ansar** | Training complete | Email | Approved, now active |
| **Partner** | Application approved | Email | Welcome + Dashboard access |
| **Partner** | New seeker assigned | Email | New seeker in your area |

---

## 📝 NOTES

- Keep everything lightweight and scrappy
- No complex CRM needed
- Focus on presence and community, not heavy tracking
- "We put communities on the map" - visibility is key value prop
- "Communities are invisible to converts" - we solve this
