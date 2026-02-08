"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { X as XIcon, Send, Megaphone, User, Loader2, Search, CheckCircle2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * ComposeModal — New message compose form.
 */

const roleBadgeLabels: Record<string, string> = {
  super_admin: "Admin",
  partner_lead: "Partner Lead",
  ansar: "Ansar",
  seeker: "Seeker",
};

const roleBadgeColors: Record<string, string> = {
  super_admin: "bg-purple-50 text-purple-600",
  partner_lead: "bg-amber-50 text-amber-600",
  ansar: "bg-emerald-50 text-emerald-600",
  seeker: "bg-sky-50 text-sky-600",
};

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: Id<"users">;
  currentUserName: string;
  currentUserRole: string;
  organizationId?: Id<"organizations">;
  canBroadcast?: boolean;
}

export function ComposeModal({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  currentUserRole,
  organizationId,
  canBroadcast = false,
}: ComposeModalProps) {
  const [mode, setMode] = useState<"direct" | "broadcast">("direct");
  const [recipientId, setRecipientId] = useState<Id<"users"> | null>(null);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [broadcastRole, setBroadcastRole] = useState("partner_lead");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const recipients = useQuery(
    api.inbox.getAvailableRecipients,
    isOpen
      ? {
          userId: currentUserId,
          userRole: currentUserRole,
          organizationId,
        }
      : "skip"
  ) ?? [];

  const startConversation = useMutation(api.inbox.startConversation);
  const sendBroadcast = useMutation(api.inbox.sendBroadcast);

  const filteredRecipients = useMemo(() => {
    if (!recipientSearch) return recipients;
    const q = recipientSearch.toLowerCase();
    return recipients.filter(
      (r: any) =>
        r.name.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q)
    );
  }, [recipients, recipientSearch]);

  const selectedRecipient = recipients.find((r: any) => r.userId === recipientId);

  // Available broadcast roles based on current user role
  const broadcastRoleOptions = useMemo(() => {
    const roles: { value: string; label: string }[] = [];
    if (currentUserRole === "super_admin") {
      roles.push({ value: "partner_lead", label: "All Partner Leads" });
      roles.push({ value: "ansar", label: "All Ansars" });
      roles.push({ value: "seeker", label: "All Seekers" });
    } else if (currentUserRole === "partner_lead") {
      roles.push({ value: "ansar", label: "All Ansars in My Org" });
      roles.push({ value: "seeker", label: "All Seekers in My Org" });
    }
    return roles;
  }, [currentUserRole]);

  const handleSend = async () => {
    if (!body.trim()) return;
    setSending(true);

    try {
      if (mode === "direct" && recipientId && selectedRecipient) {
        await startConversation({
          senderId: currentUserId,
          senderName: currentUserName,
          senderRole: currentUserRole,
          recipientId,
          recipientName: selectedRecipient.name,
          recipientRole: selectedRecipient.role,
          body: body.trim(),
          organizationId,
        });
      } else if (mode === "broadcast") {
        if (!subject.trim()) return;
        await sendBroadcast({
          senderId: currentUserId,
          senderName: currentUserName,
          senderRole: currentUserRole,
          subject: subject.trim(),
          body: body.trim(),
          recipientRole: broadcastRole,
          organizationId,
        });
      }
      setSent(true);
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setMode("direct");
    setRecipientId(null);
    setRecipientSearch("");
    setBroadcastRole("partner_lead");
    setSubject("");
    setBody("");
    setSending(false);
    setSent(false);
  };

  const canSend =
    body.trim() &&
    !sending &&
    !sent &&
    (mode === "direct" ? !!recipientId : !!subject.trim());

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => { resetForm(); onClose(); }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[520px] md:max-h-[85vh] bg-white rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[rgba(61,61,61,0.08)] flex items-center justify-between shrink-0">
              <h2 className="font-heading text-lg text-ansar-charcoal">
                {sent ? "Message Sent" : "New Message"}
              </h2>
              <button
                onClick={() => { resetForm(); onClose(); }}
                className="text-ansar-muted hover:text-ansar-charcoal transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {sent ? (
              /* Success state */
              <div className="flex-1 flex flex-col items-center justify-center py-12 px-6">
                <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                <p className="font-body text-sm text-ansar-charcoal font-medium">
                  {mode === "broadcast" ? "Broadcast sent!" : "Message sent!"}
                </p>
                <p className="font-body text-xs text-ansar-muted mt-1">
                  Recipients will be notified via SMS and email.
                </p>
              </div>
            ) : (
              /* Form */
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {/* Mode toggle */}
                {canBroadcast && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMode("direct")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all ${
                        mode === "direct"
                          ? "bg-ansar-sage-100 text-ansar-sage-700 border border-ansar-sage-300"
                          : "bg-gray-50 text-ansar-muted border border-transparent hover:bg-gray-100"
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      Direct Message
                    </button>
                    <button
                      onClick={() => setMode("broadcast")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all ${
                        mode === "broadcast"
                          ? "bg-amber-100 text-amber-700 border border-amber-300"
                          : "bg-gray-50 text-ansar-muted border border-transparent hover:bg-gray-100"
                      }`}
                    >
                      <Megaphone className="w-3.5 h-3.5" />
                      Broadcast
                    </button>
                  </div>
                )}

                {mode === "direct" ? (
                  /* Direct recipient selector */
                  <div>
                    <label className="block font-body text-xs font-medium text-ansar-charcoal mb-1.5">
                      To
                    </label>
                    {selectedRecipient ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-ansar-sage-50 border border-ansar-sage-200 rounded-lg">
                        <span className="font-body text-sm text-ansar-charcoal flex-1">
                          {selectedRecipient.name}
                        </span>
                        <span
                          className={`text-[10px] font-body font-medium px-1.5 py-0.5 rounded-full ${
                            roleBadgeColors[selectedRecipient.role] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {roleBadgeLabels[selectedRecipient.role] || selectedRecipient.role}
                        </span>
                        <button
                          onClick={() => setRecipientId(null)}
                          className="text-ansar-muted hover:text-ansar-charcoal"
                        >
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ansar-muted" />
                          <input
                            type="text"
                            value={recipientSearch}
                            onChange={(e) => setRecipientSearch(e.target.value)}
                            placeholder="Search by name or role..."
                            className="w-full pl-9 pr-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal placeholder:text-ansar-muted/50 focus:outline-none focus:border-ansar-sage-400"
                          />
                        </div>
                        <div className="max-h-40 overflow-y-auto border border-[rgba(61,61,61,0.08)] rounded-lg">
                          {filteredRecipients.length === 0 ? (
                            <p className="px-3 py-4 text-center font-body text-xs text-ansar-muted">
                              No recipients found
                            </p>
                          ) : (
                            filteredRecipients.map((r: any) => (
                              <button
                                key={r.userId}
                                onClick={() => {
                                  setRecipientId(r.userId);
                                  setRecipientSearch("");
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-ansar-sage-50/50 transition-colors text-left"
                              >
                                <span className="font-body text-sm text-ansar-charcoal flex-1 truncate">
                                  {r.name}
                                </span>
                                <span
                                  className={`text-[10px] font-body font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                                    roleBadgeColors[r.role] || "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {roleBadgeLabels[r.role] || r.role}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Broadcast role selector */
                  <div className="space-y-3">
                    <div>
                      <label className="block font-body text-xs font-medium text-ansar-charcoal mb-1.5">
                        Broadcast To
                      </label>
                      <select
                        value={broadcastRole}
                        onChange={(e) => setBroadcastRole(e.target.value)}
                        className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:border-ansar-sage-400"
                      >
                        {broadcastRoleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-body text-xs font-medium text-ansar-charcoal mb-1.5">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g., Monthly Gathering Update"
                        className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal placeholder:text-ansar-muted/50 focus:outline-none focus:border-ansar-sage-400"
                      />
                    </div>
                  </div>
                )}

                {/* Message body */}
                <div>
                  <label className="block font-body text-xs font-medium text-ansar-charcoal mb-1.5">
                    Message
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write your message..."
                    rows={5}
                    className="w-full px-3 py-2.5 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal placeholder:text-ansar-muted/50 resize-none focus:outline-none focus:border-ansar-sage-400 focus:ring-1 focus:ring-ansar-sage-200"
                  />
                </div>
              </div>
            )}

            {/* Footer */}
            {!sent && (
              <div className="px-6 py-4 border-t border-[rgba(61,61,61,0.08)] flex items-center justify-end gap-3 shrink-0">
                <button
                  onClick={() => { resetForm(); onClose(); }}
                  className="px-4 py-2 font-body text-sm text-ansar-muted hover:text-ansar-charcoal transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  className="flex items-center gap-2 px-5 py-2 bg-ansar-sage-600 text-white rounded-lg font-body text-sm font-medium hover:bg-ansar-sage-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {mode === "broadcast" ? "Send Broadcast" : "Send Message"}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
