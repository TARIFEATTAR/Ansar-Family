"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { MessageBubble } from "./MessageBubble";
import { AnimatePresence, motion } from "framer-motion";
import {
    MessageSquare, X as XIcon, Send, Loader2, ChevronDown,
    Minimize2, Inbox as InboxIcon,
} from "lucide-react";

/**
 * FLOATING CHAT WIDGET — Bottom-right persistent chat bubble
 *
 * Used by Seeker ↔ Ansar for real-time support messaging.
 * - Collapsed: floating bubble with unread badge
 * - Expanded: mini chat window with conversation thread + reply input
 * - Uses the existing inbox/conversation system from Convex
 */

interface FloatingChatWidgetProps {
    currentUserId: Id<"users">;
    currentUserName: string;
    currentUserRole: "seeker" | "ansar";
    /** The other party's user ID (e.g. for seeker → their paired ansar's userId) */
    recipientId?: Id<"users">;
    recipientName?: string;
    recipientRole?: "seeker" | "ansar";
    organizationId?: Id<"organizations">;
}

export function FloatingChatWidget({
    currentUserId,
    currentUserName,
    currentUserRole,
    recipientId,
    recipientName,
    recipientRole,
    organizationId,
}: FloatingChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);
    const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // ── Queries ─────────────────────────────────────────────
    const inbox = useQuery(
        api.inbox.getInbox,
        currentUserId ? { userId: currentUserId } : "skip"
    ) ?? [];

    const unreadTotal = useQuery(
        api.inbox.getUnreadTotal,
        currentUserId ? { userId: currentUserId } : "skip"
    ) ?? 0;

    // Auto-select the first (latest) conversation or previously selected one
    const activeConvoId = selectedConvoId || (inbox.length > 0 ? inbox[0].conversationId : undefined);

    const activeConversation = useQuery(
        api.inbox.getConversation,
        activeConvoId && currentUserId
            ? { conversationId: activeConvoId as Id<"conversations">, userId: currentUserId }
            : "skip"
    );

    // ── Mutations ──────────────────────────────────────────
    const markAsRead = useMutation(api.inbox.markAsRead);
    const replyToConversation = useMutation(api.inbox.replyToConversation);
    const startConversation = useMutation(api.inbox.startConversation);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeConversation?.messages?.length, isOpen]);

    // Mark as read when opening
    useEffect(() => {
        if (isOpen && activeConvoId && unreadTotal > 0) {
            markAsRead({ conversationId: activeConvoId as Id<"conversations">, userId: currentUserId });
        }
    }, [isOpen, activeConvoId, unreadTotal, markAsRead, currentUserId]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // ── Handlers ───────────────────────────────────────────
    const handleSendReply = async () => {
        if (!replyText.trim() || sending) return;

        setSending(true);
        try {
            if (activeConvoId) {
                // Reply to existing conversation
                await replyToConversation({
                    conversationId: activeConvoId as Id<"conversations">,
                    senderId: currentUserId,
                    senderName: currentUserName,
                    senderRole: currentUserRole,
                    body: replyText.trim(),
                });
            } else if (recipientId && recipientName && recipientRole) {
                // Start a new conversation
                await startConversation({
                    senderId: currentUserId,
                    senderName: currentUserName,
                    senderRole: currentUserRole,
                    recipientId,
                    recipientName,
                    recipientRole,
                    body: replyText.trim(),
                    organizationId: organizationId as Id<"organizations">,
                });
            }
            setReplyText("");
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendReply();
        }
    };

    // Don't render if no recipient and no existing conversations
    if (!recipientId && inbox.length === 0) return null;

    const otherPartyName = activeConversation?.participants
        ?.filter((p: any) => p.userId !== currentUserId)
        .map((p: any) => p.userName)
        .join(", ") || recipientName || (currentUserRole === "seeker" ? "Your Ansar" : "Your Seeker");

    return (
        <>
            {/* ═══ FLOATING BUBBLE ═══ */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-ansar-sage-600 to-ansar-sage-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
                        aria-label="Open chat"
                    >
                        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />

                        {/* Unread badge */}
                        {unreadTotal > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-ansar-terracotta text-white text-[10px] font-body font-bold rounded-full flex items-center justify-center ring-2 ring-white"
                            >
                                {unreadTotal > 9 ? "9+" : unreadTotal}
                            </motion.span>
                        )}

                        {/* Pulse ring when unread */}
                        {unreadTotal > 0 && (
                            <span className="absolute inset-0 rounded-full animate-ping bg-ansar-sage-400 opacity-20" />
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ═══ EXPANDED CHAT WINDOW ═══ */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl border border-[rgba(61,61,61,0.08)] flex flex-col overflow-hidden"
                    >
                        {/* ── Chat Header ── */}
                        <div className="px-4 py-3 bg-gradient-to-r from-ansar-sage-600 to-ansar-sage-700 text-white flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-body text-sm font-semibold truncate">
                                        {otherPartyName}
                                    </h3>
                                    <p className="font-body text-[10px] text-white/70">
                                        {currentUserRole === "seeker" ? "Your Ansar Support" : "Seeker Support"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {/* Conversation list toggle (if multiple) */}
                                {inbox.length > 1 && (
                                    <button
                                        onClick={() => setSelectedConvoId(null)}
                                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                        title="View all conversations"
                                    >
                                        <InboxIcon className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                    aria-label="Close chat"
                                >
                                    <Minimize2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* ── Messages Area ── */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#FAFAF8]">
                            {activeConversation?.messages?.length ? (
                                <>
                                    {activeConversation.messages.map((msg: any) => (
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
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                    <div className="w-12 h-12 bg-ansar-sage-100 rounded-full flex items-center justify-center mb-3">
                                        <MessageSquare className="w-6 h-6 text-ansar-sage-400" />
                                    </div>
                                    <p className="font-body text-sm text-ansar-charcoal font-medium mb-1">
                                        Start a Conversation
                                    </p>
                                    <p className="font-body text-xs text-ansar-muted max-w-[220px]">
                                        {currentUserRole === "seeker"
                                            ? "Send a message to your Ansar companion. They're here to support you."
                                            : "Send a message to your Seeker. They're looking forward to hearing from you."}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ── Reply Input ── */}
                        <div className="px-4 py-3 border-t border-[rgba(61,61,61,0.08)] bg-white flex-shrink-0">
                            <div className="flex items-end gap-2">
                                <textarea
                                    ref={inputRef}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a message..."
                                    rows={1}
                                    className="flex-1 px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-xl font-body text-sm text-ansar-charcoal placeholder:text-ansar-muted/50 resize-none focus:outline-none focus:border-ansar-sage-400 focus:ring-1 focus:ring-ansar-sage-200 transition-all"
                                    style={{ minHeight: "38px", maxHeight: "80px" }}
                                />
                                <button
                                    onClick={handleSendReply}
                                    disabled={!replyText.trim() || sending}
                                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-ansar-sage-600 text-white hover:bg-ansar-sage-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                                    aria-label="Send message"
                                >
                                    {sending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
