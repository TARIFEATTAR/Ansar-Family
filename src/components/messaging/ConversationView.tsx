"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { MessageBubble } from "./MessageBubble";
import { Send, ArrowLeft, Megaphone, Loader2 } from "lucide-react";

/**
 * ConversationView — Displays a message thread with reply capability.
 */

interface ConversationViewProps {
  conversationId: Id<"conversations">;
  currentUserId: Id<"users">;
  currentUserName: string;
  currentUserRole: string;
  onBack?: () => void;
}

export function ConversationView({
  conversationId,
  currentUserId,
  currentUserName,
  currentUserRole,
  onBack,
}: ConversationViewProps) {
  const conversation = useQuery(api.inbox.getConversation, {
    conversationId,
    userId: currentUserId,
  });
  const markAsRead = useMutation(api.inbox.markAsRead);
  const replyToConversation = useMutation(api.inbox.replyToConversation);

  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mark as read when opened
  useEffect(() => {
    if (conversation) {
      markAsRead({ conversationId, userId: currentUserId });
    }
  }, [conversationId, currentUserId, conversation, markAsRead]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages?.length]);

  const handleSend = async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);
    try {
      await replyToConversation({
        conversationId,
        senderId: currentUserId,
        senderName: currentUserName,
        senderRole: currentUserRole,
        body: replyText.trim(),
      });
      setReplyText("");
    } catch (error) {
      console.error("Failed to send reply:", error);
    } finally {
      setSending(false);
    }
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 text-ansar-sage-600 animate-spin" />
      </div>
    );
  }

  const otherParticipants = conversation.participants.filter(
    (p: any) => p.userId !== currentUserId
  );
  const isBroadcast = conversation.type === "broadcast";
  const headerTitle = isBroadcast
    ? conversation.subject || "Announcement"
    : otherParticipants.map((p: any) => p.userName).join(", ") || "Conversation";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[rgba(61,61,61,0.08)] bg-white shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="text-ansar-muted hover:text-ansar-charcoal transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isBroadcast && (
                <Megaphone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              )}
              <h3 className="font-body text-sm font-medium text-ansar-charcoal truncate">
                {headerTitle}
              </h3>
            </div>
            {isBroadcast && (
              <p className="font-body text-[10px] text-ansar-muted">
                Broadcast to {conversation.participants.length - 1} recipients
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#FAFAF8]">
        {conversation.messages.map((msg: any) => (
          <MessageBubble
            key={msg._id}
            senderName={msg.senderName}
            senderRole={msg.senderRole}
            body={msg.body}
            sentAt={msg.sentAt}
            isMine={msg.senderId === currentUserId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply input */}
      <div className="px-4 py-3 border-t border-[rgba(61,61,61,0.08)] bg-white shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal placeholder:text-ansar-muted/50 resize-none focus:outline-none focus:border-ansar-sage-400 focus:ring-1 focus:ring-ansar-sage-200"
            style={{ minHeight: "38px", maxHeight: "120px" }}
          />
          <button
            onClick={handleSend}
            disabled={!replyText.trim() || sending}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-ansar-sage-600 text-white hover:bg-ansar-sage-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
