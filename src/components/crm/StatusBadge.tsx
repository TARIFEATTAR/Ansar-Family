"use client";

/**
 * StatusBadge — Color-coded status pills
 *
 * Maps status values to Ansar brand colors:
 * - pending/disconnected = terracotta
 * - triaged/training = ochre
 * - approved/active/connected/sent = sage
 * - completed = success green
 * - inactive/ended/failed = muted gray
 */

const statusConfig: Record<string, { bg: string; text: string; label?: string }> = {
  // Seekers
  disconnected: { bg: "bg-ansar-terracotta-100", text: "text-ansar-terracotta-700", label: "Disconnected" },
  triaged: { bg: "bg-ansar-ochre-100", text: "text-ansar-ochre-700", label: "Triaged" },
  connected: { bg: "bg-ansar-sage-100", text: "text-ansar-sage-700", label: "Connected" },

  // Ansars
  pending: { bg: "bg-ansar-terracotta-100", text: "text-ansar-terracotta-700", label: "Pending" },
  approved: { bg: "bg-ansar-sage-100", text: "text-ansar-sage-700", label: "Approved" },
  active: { bg: "bg-ansar-sage-100", text: "text-ansar-sage-700", label: "Active" },
  inactive: { bg: "bg-ansar-sage-50", text: "text-ansar-muted", label: "Inactive" },
  training: { bg: "bg-ansar-ochre-100", text: "text-ansar-ochre-700", label: "Training" },

  // Pairings
  pending_intro: { bg: "bg-ansar-ochre-100", text: "text-ansar-ochre-700", label: "Pending Intro" },
  completed: { bg: "bg-[#e8f0e8]", text: "text-ansar-success", label: "Completed" },
  paused: { bg: "bg-ansar-ochre-50", text: "text-ansar-ochre-600", label: "Paused" },
  ended: { bg: "bg-ansar-sage-50", text: "text-ansar-muted", label: "Ended" },

  // Partners
  rejected: { bg: "bg-[#fbe8e8]", text: "text-ansar-error", label: "Rejected" },

  // Messages
  sent: { bg: "bg-ansar-sage-100", text: "text-ansar-sage-700", label: "Sent" },
  failed: { bg: "bg-[#fbe8e8]", text: "text-ansar-error", label: "Failed" },

  // Journey Types
  new_muslim: { bg: "bg-ansar-terracotta-100", text: "text-ansar-terracotta-700", label: "New Muslim" },
  reconnecting: { bg: "bg-ansar-ochre-100", text: "text-ansar-ochre-700", label: "Reconnecting" },
  seeker: { bg: "bg-ansar-sage-100", text: "text-ansar-sage-700", label: "Seeker" },

  // Message types
  sms: { bg: "bg-ansar-ochre-100", text: "text-ansar-ochre-700", label: "SMS" },
  email: { bg: "bg-ansar-sage-100", text: "text-ansar-sage-700", label: "Email" },

  // Practice Levels
  consistent: { bg: "bg-ansar-sage-100", text: "text-ansar-sage-700", label: "Consistent" },
  steady: { bg: "bg-ansar-ochre-100", text: "text-ansar-ochre-700", label: "Steady" },
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, label, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    bg: "bg-ansar-sage-50",
    text: "text-ansar-muted",
    label: status,
  };

  const displayLabel = label || config.label || status.replace(/_/g, " ");
  const sizeClasses = size === "sm"
    ? "text-[11px] px-2 py-0.5"
    : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center rounded-full font-body font-medium capitalize ${config.bg} ${config.text} ${sizeClasses}`}
    >
      {displayLabel}
    </span>
  );
}
