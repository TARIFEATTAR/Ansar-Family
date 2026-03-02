"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const CAL_URL = "https://cal.com/hassankhawaja/ansar-family";

function ScheduleContent() {
    const searchParams = useSearchParams();
    const name = searchParams.get("name") || "";
    const email = searchParams.get("email") || "";

    // Build the Cal.com embed URL with pre-filled params
    const calEmbedParams = new URLSearchParams();
    if (name) calEmbedParams.set("name", name);
    if (email) calEmbedParams.set("email", email);
    const embedUrl = `${CAL_URL}?${calEmbedParams.toString()}&embed=true&theme=light`;

    return (
        <div className="min-h-screen bg-gradient-to-b from-ansar-cream to-white">
            {/* Header */}
            <header className="px-6 py-4 border-b border-[rgba(61,61,61,0.06)] bg-white/80 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-ansar-gray hover:text-ansar-charcoal transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-body">Back to Home</span>
                    </Link>
                    <span className="font-heading text-lg text-ansar-charcoal">Ansar Family</span>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-10 md:py-16">
                {/* Top Section: Heading + Reassurance */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-10 md:mb-14"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-ansar-sage-50 border border-ansar-sage-200/50 rounded-full mb-5">
                        <Calendar className="w-4 h-4 text-ansar-sage-600" />
                        <span className="font-body text-xs font-medium text-ansar-sage-700 tracking-wide uppercase">
                            Schedule a Call
                        </span>
                    </div>

                    <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-ansar-charcoal mb-4 leading-tight tracking-tight">
                        Let&apos;s talk about your community.
                    </h1>

                    <p className="font-body text-base md:text-lg text-ansar-gray max-w-[560px] mx-auto leading-relaxed">
                        Pick a time that works for you. We&apos;ll walk through how Ansar Family
                        can support your community&apos;s new Muslim care.
                    </p>
                </motion.div>

                {/* Main Content: Calendar + Side Info */}
                <div className="grid lg:grid-cols-[1fr_300px] gap-8 lg:gap-12 items-start">
                    {/* Calendar Embed */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                        className="bg-white rounded-2xl border border-[rgba(61,61,61,0.08)] shadow-soft overflow-hidden"
                    >
                        <div className="w-full" style={{ minHeight: "660px" }}>
                            <iframe
                                src={embedUrl}
                                className="w-full border-0"
                                style={{ height: "660px", minHeight: "660px" }}
                                title="Schedule a call with Ansar Family"
                                allow="payment"
                            />
                        </div>
                    </motion.div>

                    {/* Side Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        className="space-y-6"
                    >
                        {/* What to Expect Card */}
                        <div className="bg-white rounded-xl border border-[rgba(61,61,61,0.06)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                            <h3 className="font-heading text-base text-ansar-charcoal mb-4">What to expect</h3>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <Clock className="w-4 h-4 text-ansar-sage-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-body text-sm text-ansar-charcoal font-medium">15-minute intro call</p>
                                        <p className="font-body text-xs text-ansar-gray mt-0.5">
                                            Quick and focused — we respect your time.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-ansar-sage-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-body text-sm text-ansar-charcoal font-medium">Learn about Partner Hubs</p>
                                        <p className="font-body text-xs text-ansar-gray mt-0.5">
                                            We&apos;ll share how communities use Ansar to connect and support new Muslims.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-ansar-sage-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-body text-sm text-ansar-charcoal font-medium">No pressure, no obligations</p>
                                        <p className="font-body text-xs text-ansar-gray mt-0.5">
                                            Just a friendly conversation about what&apos;s possible.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Response Time Note */}
                        <div className="bg-ansar-sage-50/60 rounded-xl border border-ansar-sage-200/30 p-5">
                            <p className="font-body text-sm text-ansar-sage-800 leading-relaxed">
                                <span className="font-medium">Can&apos;t find a time?</span> No worries — we&apos;ll
                                reach out within 24 hours of your form submission to find a time that works.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default function SchedulePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-ansar-cream flex items-center justify-center">
                    <div className="animate-pulse font-body text-ansar-gray">Loading calendar...</div>
                </div>
            }
        >
            <ScheduleContent />
        </Suspense>
    );
}
