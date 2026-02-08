"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ConversationView } from "./ConversationView";
import { ComposeModal } from "./ComposeModal";
import {
  Inbox, PenSquare, Megaphone, Search, MessageSquare, Loader2, User,
} from "lucide-react";
import { formatRelativeTime, getInitials, roleBadgeLabels } from "./MessageBubble";

/**
 * InboxTab — Reusable inbox list for all dashboards.
 */

const roleColors: Record<string, string> = {
  super_admin: "bg-purple-500",
  partner_lead: "bg-amber-500",
  ansar: "bg-emerald-500",
  seeker: "bg-sky-500",
};

const roleBadgeColors: Record<string, string> = {
  super_admin: "bg-purple-50 text-purple-600",
  partner_lead: "bg-amber-50 text-amber-600",
  ansar: "bg-emerald-50 text-emerald-600",
  seeker: "bg-sky-50 text-sky-600",
};

interface InboxTabProps {
  currentUserId: Id<"users">;
  currentUserName: string;
  currentUserRole: string;
  organizationId?: Id<"organizations">;
}

export function InboxTab({
  currentUserId,
  currentUserName,
  currentUserRole,
  organizationId,
}: InboxTabProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<
    Id<"conversations"> | null
  >(null);
  const [showCompose, setShowCompose] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const inbox =
    useQuery(api.inbox.getInbox, { userId: currentUserId }) ?? [];

  const canBroadcast =
    currentUserRole === "super_admin" || currentUserRole === "partner_lead";

  // Filter conversations by search
  const filtered = useMemo(() => {
    if (!searchQuery) return inbox;
    const q = searchQuery.toLowerCase();
    return inbox.filter(
      (item: any) =>
        item.lastMessagePreview.toLowerCase().includes(q) ||
        item.lastMessageSenderName.toLowerCase().includes(q) ||
        item.subject?.toLowerCase().includes(q) ||
        item.otherParticipants.some((p: any) =>
          p.userName.toLowerCase().includes(q)
        )
    );
  }, [inbox, searchQuery]);

  const totalUnread = inbox.reduce((sum: number, item: any) => sum + item.unreadCount, 0);

  // If a conversation is selected, show the thread view
  if (selectedConversationId) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[rgba(61,61,61,0.06)] overflow-hidden" style={{ height: "calc(100vh - 260px)", minHeight: "500px" }}>
        <ConversationView
          conversationId={selectedConversationId}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserRole={currentUserRole}
          onBack={() => setSelectedConversationId(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 border border-[rgba(61,61,61,0.06)]">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-ansar-sage-600" />
            <span className="font-body text-[11px] text-ansar-muted uppercase tracking-wider">
              Conversations
            </span>
          </div>
          <p className="font-heading text-xl text-ansar-charcoal">
            {inbox.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[rgba(61,61,61,0.06)]">
          <div className="flex items-center gap-2 mb-1">
            <Inbox className="w-4 h-4 text-amber-500" />
            <span className="font-body text-[11px] text-ansar-muted uppercase tracking-wider">
              Unread
            </span>
          </div>
          <p className="font-heading text-xl text-ansar-charcoal">
            {totalUnread}
          </p>
        </div>
        {canBroadcast && (
          <div className="bg-white rounded-xl p-4 border border-[rgba(61,61,61,0.06)]">
            <div className="flex items-center gap-2 mb-1">
              <Megaphone className="w-4 h-4 text-purple-500" />
              <span className="font-body text-[11px] text-ansar-muted uppercase tracking-wider">
                Broadcasts
              </span>
            </div>
            <p className="font-heading text-xl text-ansar-charcoal">
              {inbox.filter((i: any) => i.type === "broadcast").length}
            </p>
          </div>
        )}
      </div>

      {/* Search + Compose */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ansar-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[rgba(61,61,61,0.08)] rounded-xl font-body text-sm text-ansar-charcoal placeholder:text-ansar-muted/50 focus:outline-none focus:border-ansar-sage-400 focus:ring-1 focus:ring-ansar-sage-200"
          />
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-ansar-sage-600 text-white rounded-xl font-body text-sm font-medium hover:bg-ansar-sage-700 transition-colors shrink-0"
        >
          <PenSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Compose</span>
        </button>
      </div>

      {/* Conversation list */}
      <div className="bg-white rounded-2xl shadow-sm border border-[rgba(61,61,61,0.06)] overflow-hidden divide-y divide-[rgba(61,61,61,0.06)]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <Inbox className="w-10 h-10 text-ansar-muted/40 mb-4" />
            <p className="font-body text-sm text-ansar-muted">
              {inbox.length === 0
                ? "No messages yet. Start a conversation!"
                : "No conversations match your search."}
            </p>
          </div>
        ) : (
          filtered.map((item: any) => {
            const isBroadcast = item.type === "broadcast";
            const displayName = isBroadcast
              ? item.subject || "Announcement"
              : item.otherParticipants.map((p: any) => p.userName).join(", ") ||
                "Unknown";
            const primaryParticipant = item.otherParticipants[0];
            const avatarInitials = primaryParticipant
              ? getInitials(primaryParticipant.userName)
              : "?";
            const avatarBg = isBroadcast
              ? "bg-amber-500"
              : primaryParticipant
                ? roleColors[primaryParticipant.userRole] || "bg-gray-400"
                : "bg-gray-400";

            return (
              <button
                key={item.conversationId}
                onClick={() => setSelectedConversationId(item.conversationId)}
                className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-ansar-sage-50/30 transition-colors text-left"
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${avatarBg}`}
                >
                  {isBroadcast ? (
                    <Megaphone className="w-4.5 h-4.5" />
                  ) : (
                    avatarInitials
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`font-body text-[13px] truncate ${
                          item.unreadCount > 0
                            ? "font-semibold text-ansar-charcoal"
                            : "font-medium text-ansar-charcoal"
                        }`}
                      >
                        {displayName}
                      </span>
                      {primaryParticipant && !isBroadcast && (
                        <span
                          className={`text-[9px] font-body font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                            roleBadgeColors[primaryParticipant.userRole] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {roleBadgeLabels[primaryParticipant.userRole] ||
                            primaryParticipant.userRole}
                        </span>
                      )}
                      {isBroadcast && (
                        <span className="text-[9px] font-body font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 shrink-0">
                          Broadcast
                        </span>
                      )}
                    </div>
                    <span className="font-body text-[10px] text-ansar-muted shrink-0">
                      {formatRelativeTime(item.lastMessageAt)}
                    </span>
                  </div>
                  <p
                    className={`font-body text-[12px] mt-0.5 truncate ${
                      item.unreadCount > 0
                        ? "text-ansar-charcoal font-medium"
                        : "text-ansar-muted"
                    }`}
                  >
                    {item.lastMessageSenderName}: {item.lastMessagePreview}
                  </p>
                </div>

                {/* Unread badge */}
                {item.unreadCount > 0 && (
                  <div className="w-5 h-5 rounded-full bg-ansar-sage-600 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-white text-[10px] font-bold">
                      {item.unreadCount > 9 ? "9+" : item.unreadCount}
                    </span>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Compose Modal */}
      <ComposeModal
        isOpen={showCompose}
        onClose={() => setShowCompose(false)}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserRole={currentUserRole}
        organizationId={organizationId}
        canBroadcast={canBroadcast}
      />
    </div>
  );
}
