"use client";

/**
 * StatusBadge — Color-coded status pills with dot indicator
 *
 * Maps status values to Ansar brand colors:
 * - pending/disconnected/awaiting_outreach = terracotta
 * - triaged/training = ochre
 * - approved/active/connected/sent = sage
 * - completed = success green
 * - inactive/ended/failed = muted gray
 */

const statusConfig: Record<
  string,
  { dot: string; bg: string; text: string; label?: string }
> = {
  // Seekers
  awaiting_outreach: {
    dot: "bg-ansar-terracotta-500",
    bg: "bg-ansar-terracotta-50",
    text: "text-ansar-terracotta-700",
    label: "Awaiting Outreach",
  },
  disconnected: {
    dot: "bg-ansar-terracotta-500",
    bg: "bg-ansar-terracotta-50",
    text: "text-ansar-terracotta-700",
    label: "Disconnected",
  },
  triaged: {
    dot: "bg-ansar-ochre-500",
    bg: "bg-ansar-ochre-50",
    text: "text-ansar-ochre-700",
    label: "Triaged",
  },
  connected: {
    dot: "bg-ansar-sage-500",
    bg: "bg-ansar-sage-50",
    text: "text-ansar-sage-700",
    label: "Connected",
  },

  // Ansars
  pending: {
    dot: "bg-ansar-terracotta-400",
    bg: "bg-ansar-terracotta-50",
    text: "text-ansar-terracotta-700",
    label: "Pending",
  },
  approved: {
    dot: "bg-ansar-sage-500",
    bg: "bg-ansar-sage-50",
    text: "text-ansar-sage-700",
    label: "Approved",
  },
  active: {
    dot: "bg-ansar-sage-500",
    bg: "bg-ansar-sage-50",
    text: "text-ansar-sage-700",
    label: "Active",
  },
  inactive: {
    dot: "bg-gray-400",
    bg: "bg-gray-50",
    text: "text-ansar-muted",
    label: "Inactive",
  },
  training: {
    dot: "bg-ansar-ochre-500",
    bg: "bg-ansar-ochre-50",
    text: "text-ansar-ochre-700",
    label: "Training",
  },

  // Pairings
  pending_intro: {
    dot: "bg-ansar-ochre-400",
    bg: "bg-ansar-ochre-50",
    text: "text-ansar-ochre-700",
    label: "Pending Intro",
  },
  completed: {
    dot: "bg-ansar-success",
    bg: "bg-[#f0f5f0]",
    text: "text-ansar-success",
    label: "Completed",
  },
  paused: {
    dot: "bg-ansar-ochre-400",
    bg: "bg-ansar-ochre-50",
    text: "text-ansar-ochre-600",
    label: "Paused",
  },
  ended: {
    dot: "bg-gray-400",
    bg: "bg-gray-50",
    text: "text-ansar-muted",
    label: "Ended",
  },

  // Partners
  rejected: {
    dot: "bg-ansar-error",
    bg: "bg-[#fef2f2]",
    text: "text-ansar-error",
    label: "Rejected",
  },

  // Messages
  sent: {
    dot: "bg-ansar-sage-500",
    bg: "bg-ansar-sage-50",
    text: "text-ansar-sage-700",
    label: "Sent",
  },
  failed: {
    dot: "bg-ansar-error",
    bg: "bg-[#fef2f2]",
    text: "text-ansar-error",
    label: "Failed",
  },

  // Journey Types
  new_muslim: {
    dot: "bg-ansar-terracotta-500",
    bg: "bg-ansar-terracotta-50",
    text: "text-ansar-terracotta-700",
    label: "New Muslim",
  },
  reconnecting: {
    dot: "bg-ansar-ochre-500",
    bg: "bg-ansar-ochre-50",
    text: "text-ansar-ochre-700",
    label: "Reconnecting",
  },
  seeker: {
    dot: "bg-ansar-sage-500",
    bg: "bg-ansar-sage-50",
    text: "text-ansar-sage-700",
    label: "Seeker",
  },

  // Message types
  sms: {
    dot: "bg-ansar-ochre-500",
    bg: "bg-ansar-ochre-50",
    text: "text-ansar-ochre-700",
    label: "SMS",
  },
  email: {
    dot: "bg-ansar-sage-500",
    bg: "bg-ansar-sage-50",
    text: "text-ansar-sage-700",
    label: "Email",
  },

  // Practice Levels
  consistent: {
    dot: "bg-ansar-sage-500",
    bg: "bg-ansar-sage-50",
    text: "text-ansar-sage-700",
    label: "Consistent",
  },
  steady: {
    dot: "bg-ansar-ochre-500",
    bg: "bg-ansar-ochre-50",
    text: "text-ansar-ochre-700",
    label: "Steady",
  },

  // Roles
  super_admin: {
    dot: "bg-ansar-terracotta-500",
    bg: "bg-ansar-terracotta-50",
    text: "text-ansar-terracotta-700",
    label: "Super Admin",
  },
  partner_lead: {
    dot: "bg-ansar-ochre-500",
    bg: "bg-ansar-ochre-50",
    text: "text-ansar-ochre-700",
    label: "Partner Lead",
  },
  ansar: {
    dot: "bg-ansar-sage-500",
    bg: "bg-ansar-sage-50",
    text: "text-ansar-sage-700",
    label: "Ansar",
  },

  // Contact roles
  imam: {
    dot: "bg-ansar-ochre-500",
    bg: "bg-ansar-ochre-50",
    text: "text-ansar-ochre-700",
    label: "Imam",
  },
  donor: {
    dot: "bg-ansar-terracotta-500",
    bg: "bg-ansar-terracotta-50",
    text: "text-ansar-terracotta-700",
    label: "Donor",
  },
  community_member: {
    dot: "bg-ansar-sage-500",
    bg: "bg-ansar-sage-50",
    text: "text-ansar-sage-700",
    label: "Community Member",
  },
  family_member: {
    dot: "bg-ansar-ochre-400",
    bg: "bg-ansar-ochre-50",
    text: "text-ansar-ochre-700",
    label: "Family Member",
  },
  scholar: {
    dot: "bg-ansar-sage-600",
    bg: "bg-ansar-sage-50",
    text: "text-ansar-sage-700",
    label: "Scholar",
  },
  volunteer: {
    dot: "bg-ansar-sage-400",
    bg: "bg-ansar-sage-50",
    text: "text-ansar-sage-700",
    label: "Volunteer",
  },
  other: {
    dot: "bg-gray-400",
    bg: "bg-gray-50",
    text: "text-ansar-muted",
    label: "Other",
  },
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, label, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    dot: "bg-gray-400",
    bg: "bg-gray-50",
    text: "text-ansar-muted",
    label: status,
  };

  const displayLabel = label || config.label || status.replace(/_/g, " ");
  const sizeClasses =
    size === "sm" ? "text-[11px] px-2.5 py-[3px]" : "text-xs px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-body font-medium capitalize ${config.bg} ${config.text} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
      {displayLabel}
    </span>
  );
}
