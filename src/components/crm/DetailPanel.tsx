"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

/**
 * DetailPanel — Right-side slide-over for full record details
 * Full-screen overlay on mobile, side panel on desktop.
 */

interface DetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function DetailPanel({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  actions,
}: DetailPanelProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full md:w-[480px] lg:w-[540px] bg-white shadow-[-8px_0_32px_rgba(61,61,61,0.08)] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-[rgba(61,61,61,0.08)]">
              <div className="flex-1 min-w-0">
                {title && (
                  <h2 className="font-heading text-xl text-ansar-charcoal truncate">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="font-body text-sm text-ansar-muted mt-0.5">{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 -mr-1.5 text-ansar-muted hover:text-ansar-charcoal hover:bg-ansar-sage-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {children}
            </div>

            {/* Footer Actions */}
            {actions && (
              <div className="px-6 py-4 border-t border-[rgba(61,61,61,0.08)] flex items-center justify-end gap-3">
                {actions}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * DetailField — A single labeled field inside a DetailPanel
 */
export function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="py-2.5 border-b border-[rgba(61,61,61,0.04)] last:border-0">
      <dt className="font-body text-[11px] font-medium uppercase tracking-wider text-ansar-muted mb-0.5">
        {label}
      </dt>
      <dd className="font-body text-sm text-ansar-charcoal">{children}</dd>
    </div>
  );
}
