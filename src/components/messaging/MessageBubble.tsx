"use client";

/**
 * MessageBubble — Individual message display in a conversation thread.
 */

const roleColors: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700",
  partner_lead: "bg-amber-100 text-amber-700",
  ansar: "bg-emerald-100 text-emerald-700",
  seeker: "bg-sky-100 text-sky-700",
};

const roleBadgeLabels: Record<string, string> = {
  super_admin: "Admin",
  partner_lead: "Partner Lead",
  ansar: "Ansar",
  seeker: "Seeker",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface MessageBubbleProps {
  senderName: string;
  senderRole: string;
  body: string;
  sentAt: number;
  isMine: boolean;
}

export function MessageBubble({
  senderName,
  senderRole,
  body,
  sentAt,
  isMine,
}: MessageBubbleProps) {
  const initials = getInitials(senderName);
  const avatarColor = isMine
    ? "bg-ansar-sage-600 text-white"
    : "bg-gray-200 text-gray-600";
  const bubbleColor = isMine
    ? "bg-ansar-sage-50 border-ansar-sage-200"
    : "bg-white border-[rgba(61,61,61,0.08)]";
  const roleColor = roleColors[senderRole] || "bg-gray-100 text-gray-600";
  const roleLabel = roleBadgeLabels[senderRole] || senderRole;

  return (
    <div
      className={`flex gap-2.5 ${isMine ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${avatarColor}`}
      >
        {initials}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"}`}>
        {/* Sender info */}
        <div
          className={`flex items-center gap-2 mb-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}
        >
          <span className="font-body text-[11px] font-medium text-ansar-charcoal">
            {isMine ? "You" : senderName}
          </span>
          <span
            className={`text-[9px] font-body font-medium px-1.5 py-0.5 rounded-full ${roleColor}`}
          >
            {roleLabel}
          </span>
        </div>

        {/* Message body */}
        <div
          className={`px-3.5 py-2.5 rounded-xl border ${bubbleColor} ${
            isMine ? "rounded-tr-sm" : "rounded-tl-sm"
          }`}
        >
          <p className="font-body text-[13px] text-ansar-charcoal leading-relaxed whitespace-pre-wrap">
            {body}
          </p>
        </div>

        {/* Timestamp */}
        <p
          className={`font-body text-[10px] text-ansar-muted mt-1 ${isMine ? "text-right" : "text-left"}`}
        >
          {formatRelativeTime(sentAt)}
        </p>
      </div>
    </div>
  );
}

export { formatRelativeTime, getInitials, roleColors, roleBadgeLabels };
