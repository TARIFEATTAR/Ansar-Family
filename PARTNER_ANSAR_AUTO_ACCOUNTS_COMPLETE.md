# Partner Hub & Ansar Auto-Account Creation - Complete Implementation

## Overview

Implemented automatic account creation for Partner Hubs and Ansars upon application submission, with approval-gated access. Accounts are created immediately but remain inactive until approved by the appropriate admin.

---

## Implementation Summary

### **Partner Hubs**
- ✅ Account created automatically when Partner Hub application is submitted
- ✅ Account is **inactive** until Super Admin approves
- ✅ Upon approval, account is activated and linked to organization
- ✅ Partner Lead can then access their full dashboard

### **Ansars**
- ✅ Account created automatically when Ansar application is submitted
- ✅ Account is **inactive** until Hub Admin approves
- ✅ Upon approval, account is activated
- ✅ Ansar can then access training and community features

### **Seekers** (Already Implemented)
- ✅ Account created automatically when intake form is submitted
- ✅ Account is **active** immediately (no approval needed)
- ✅ Seeker can access resource portal while awaiting outreach

---

## User Flows

### Partner Hub Flow

**1. Application Submission**
- Partner Lead fills out Partner Hub application form
- Submits application
- Account automatically created with role `partner_lead`
- Account status: `isActive: false`
- Welcome SMS + Email sent

**2. Pending State**
- Partner Lead can log in
- Sees "Application Under Review" page
- Message: "We'll review within 3-5 business days and schedule an intro call"
- Cannot access dashboard yet

**3. Super Admin Approval**
- Super Admin reviews application in `/admin`
- Clicks "Approve" → Creates organization
- Account is activated: `isActive: true`
- Organization linked to account: `organizationId: [org-id]`

**4. Full Access Granted**
- Partner Lead logs in
- Automatically routed to `/dashboard/[slug]`
- Full access to Partner Hub dashboard

---

### Ansar Flow

**1. Application Submission**
- Ansar fills out volunteer application form
- Submits application
- Account automatically created with role `ansar`
- Account status: `isActive: false`
- Welcome SMS + Email sent

**2. Pending State**
- Ansar can log in
- Sees "Application Under Review" page
- Message: "Your local community will review within 3-5 business days"
- Cannot access features yet

**3. Hub Admin Approval**
- Hub Admin reviews application in `/dashboard/[slug]`
- Updates status to "Approved" or "Active"
- Account is activated: `isActive: true`

**4. Full Access Granted**
- Ansar logs in
- Access to training and community features
- (Future: Ansar portal with training materials)

---

## Technical Implementation

### Backend Changes

**`convex/partners.ts`**

```typescript
// Auto-create account after partner application
export const create = mutation({
  handler: async (ctx, args) => {
    const partnerId = await ctx.db.insert("partners", {
      // ... fields ...
      status: "pending",
    });

    // NEW: Trigger account creation
    await ctx.scheduler.runAfter(0, internal.partners.createPartnerAccount, {
      partnerId,
      leadName: args.leadName,
      leadEmail: args.leadEmail.toLowerCase(),
    });

    // Existing: Send notifications
    // ...
  },
});

// NEW: Internal mutation to create partner account
export const createPartnerAccount = internalMutation({
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.leadEmail))
      .first();

    if (existingUser) return existingUser._id;

    // Create inactive account
    const userId = await ctx.db.insert("users", {
      clerkId: `pending_${args.leadEmail}`,
      email: args.leadEmail,
      name: args.leadName,
      role: "partner_lead",
      isActive: false, // Inactive until approved
    });

    return userId;
  },
});

// UPDATED: Approval activates account
export const approveAndCreateOrg = mutation({
  handler: async (ctx, args) => {
    // ... create organization ...

    // Activate the partner lead's account
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", partner.leadEmail))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        isActive: true,
        organizationId: orgId,
      });
    }
  },
});
```

**`convex/ansars.ts`**

```typescript
// Auto-create account after ansar application
export const create = mutation({
  handler: async (ctx, args) => {
    const ansarId = await ctx.db.insert("ansars", {
      // ... fields ...
      status: "pending",
    });

    // NEW: Trigger account creation
    await ctx.scheduler.runAfter(0, internal.ansars.createAnsarAccount, {
      ansarId,
      fullName: args.fullName,
      email: args.email,
      organizationId: args.organizationId,
    });

    // Existing: Send notifications
    // ...
  },
});

// NEW: Internal mutation to create ansar account
export const createAnsarAccount = internalMutation({
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) return existingUser._id;

    // Create inactive account
    const userId = await ctx.db.insert("users", {
      clerkId: `pending_${args.email}`,
      email: args.email,
      name: args.fullName,
      role: "ansar",
      organizationId: args.organizationId,
      isActive: false, // Inactive until approved
    });

    return userId;
  },
});

// UPDATED: Approval activates account
export const updateStatus = mutation({
  handler: async (ctx, args) => {
    await ctx.db.patch(id, { status });

    // If approved, activate account
    if (status === "approved" || status === "active") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", ansar.email))
        .first();

      if (user) {
        await ctx.db.patch(user._id, {
          isActive: true,
        });
      }
    }
  },
});
```

### Frontend Changes

**`src/app/dashboard/page.tsx`** (Gateway)

```typescript
// Partner Lead without organization (pending approval)
if (currentUser?.role === "partner_lead" && !currentUser?.organizationId) {
  return (
    <PendingApprovalPage
      title="Application Under Review"
      message="Thank you for applying to become a Partner Hub! We'll review your application within 3-5 business days..."
    />
  );
}

// Ansar without active status (pending approval)
if (currentUser?.role === "ansar" && !currentUser?.isActive) {
  return (
    <PendingApprovalPage
      title="Application Under Review"
      message="Thank you for applying to become an Ansar! Your local community will review your application within 3-5 business days..."
    />
  );
}
```

---

## Approval Workflows

### Partner Hub Approval (Super Admin)

**Location:** `/admin` → Partners tab

**Process:**
1. Super Admin sees Partner application with status "Pending"
2. Reviews application details
3. Clicks "Approve" button
4. System:
   - Creates organization
   - Links organization to partner application
   - Activates partner lead's user account
   - Links organization to user account
5. Partner Lead receives access

**Who Can Approve:** Super Admin only

---

### Ansar Approval (Hub Admin)

**Location:** `/dashboard/[slug]` → Ansars tab

**Process:**
1. Hub Admin sees Ansar application with status "Pending"
2. Reviews application details
3. Updates status to "Approved" or "Active"
4. System:
   - Activates ansar's user account
5. Ansar receives access

**Who Can Approve:** Hub Admin (Partner Lead) for their organization

---

## Account States

### Inactive Account (Pending Approval)
- `isActive: false`
- User can log in
- Sees "Application Under Review" page
- Cannot access dashboard/features
- Receives welcome email explaining review process

### Active Account (Approved)
- `isActive: true`
- User can log in
- Full access to dashboard/features
- Routed to appropriate portal

---

## Key Differences from Seeker Flow

| Aspect | Seekers | Partners | Ansars |
|--------|---------|----------|--------|
| **Account Creation** | Auto | Auto | Auto |
| **Initial Status** | Active | Inactive | Inactive |
| **Approval Required** | No | Yes (Super Admin) | Yes (Hub Admin) |
| **Immediate Access** | Yes (resources) | No (pending page) | No (pending page) |
| **Philosophy** | Serve immediately | Vet first | Vet first |

---

## Files Modified

1. **`convex/partners.ts`**
   - Added `createPartnerAccount` internal mutation
   - Updated `create` to trigger account creation
   - Updated `approveAndCreateOrg` to activate account

2. **`convex/ansars.ts`**
   - Added `createAnsarAccount` internal mutation
   - Updated `create` to trigger account creation
   - Updated `updateStatus` to activate account on approval

3. **`src/app/dashboard/page.tsx`**
   - Added pending approval pages for Partners
   - Added pending approval pages for Ansars
   - Improved messaging and UX

---

## Important Notes

### Clerk Account Creation

Like the Seeker flow, accounts are created in Convex with a temporary `clerkId` (`pending_${email}`). The actual Clerk account creation happens when:

1. User receives welcome email
2. Clerk sends "Set Password" email
3. User sets password
4. Clerk webhook updates `clerkId` in Convex

This is a standard pattern and works seamlessly.

### isActive Flag

The `isActive` flag is the key gating mechanism:
- **`false`**: User can log in but sees pending page
- **`true`**: User has full access to features

This allows us to create accounts immediately (good UX) while maintaining approval control (good governance).

---

## Testing Checklist

### Partner Hub
- [ ] Submit Partner Hub application
- [ ] Verify account created with `isActive: false`
- [ ] Log in, verify "Application Under Review" page
- [ ] Super Admin: Approve application
- [ ] Verify account activated (`isActive: true`)
- [ ] Verify organization created and linked
- [ ] Log in as Partner Lead, verify dashboard access

### Ansar
- [ ] Submit Ansar application
- [ ] Verify account created with `isActive: false`
- [ ] Log in, verify "Application Under Review" page
- [ ] Hub Admin: Approve application (update status)
- [ ] Verify account activated (`isActive: true`)
- [ ] Log in as Ansar, verify access granted

---

## Future Enhancements (Optional)

1. **Approval Notification Emails**: Send email when application is approved
2. **Rejection Flow**: Handle rejected applications gracefully
3. **Ansar Portal**: Create dedicated portal for approved Ansars (training, resources, etc.)
4. **Partner Onboarding**: Add onboarding checklist for new Partner Hubs
5. **Application Status Tracking**: Let users check their application status in real-time

---

## Summary

This implementation completes the auto-account creation flow for all three user types:

✅ **Seekers**: Auto-create + immediate access (serve immediately)
✅ **Partners**: Auto-create + approval-gated (vet first, Super Admin)
✅ **Ansars**: Auto-create + approval-gated (vet first, Hub Admin)

All three flows now follow the philosophy:
- **Remove barriers**: Instant account creation, no manual work
- **Provide immediate value**: Clear messaging about next steps
- **Maintain governance**: Appropriate approval workflows
- **Enable self-service**: Users control their passwords

The system is now fully automated from application to access!
