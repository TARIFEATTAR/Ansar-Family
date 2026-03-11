"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2, Shield, Lock } from "lucide-react";

/**
 * SEEKER INTAKE FORM — "The New Journey"
 * Refactored to 2-Step "Gradual Engagement" Flow
 * 
 * Step 1: Human Connection (Intake)
 * Step 2: Account Creation (Safety Net)
 */

const EASE_OUT_QUINT = [0.19, 1, 0.22, 1] as const;

type JourneyType = "new_muslim" | "reconnecting" | "seeker";
type Gender = "male" | "female";

interface FormData {
  // Step 1: Intake
  fullName: string;
  gender: Gender | "";
  city: string;
  stateRegion: string;
  journeyType: JourneyType | "";
  heardAboutAnsar: string;
  supportAreas: string[];
  otherDetails: string;

  // Step 2: Account
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  returnToIslamReason: string;
  consentGiven: boolean;
  
  // Removed/Optional (Backend handles undefined)
  dateOfBirth?: string;
  countryOfOrigin?: string;
  address?: string;
}

const initialFormData: FormData = {
  fullName: "",
  gender: "",
  city: "",
  stateRegion: "",
  journeyType: "",
  heardAboutAnsar: "",
  supportAreas: [],
  otherDetails: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  returnToIslamReason: "",
  consentGiven: false,
};

const supportOptions = [
  "The Basics: Learning how to pray, read Quran, or the 5 Pillars",
  "Relationships: Navigating family, friends, or social changes",
  "Marriage: Seeking a spouse or navigating an existing marriage",
  "Social Connection: Just looking for a community and friends to eat with",
  "Mental Health/Well-being: Dealing with isolation, anxiety, or stress",
  "Substances/Addiction: Seeking a judgment-free space for recovery support",
  "Hard Questions: I have doubts or complex theological questions",
  "Other",
];

const journeyOptions: { value: JourneyType; label: string; description: string }[] = [
  {
    value: "new_muslim",
    label: "I am a New Muslim",
    description: "I have already taken my Shahada",
  },
  {
    value: "reconnecting",
    label: "I was born into a Muslim family",
    description: "And I am looking to reconnect with the faith",
  },
  {
    value: "seeker",
    label: "I am a Seeker",
    description: "I am interested in Islam but haven't converted yet",
  },
];

const heardAboutOptions = [
  "A friend or family member",
  "A local masjid or mosque",
  "Online search",
  "Social media",
  "Community event",
  "Other",
];

const inspirationVideos = [
  {
    title: "Jalil Jan's Story",
    embedUrl: "https://www.youtube.com/embed/T0eWFYF5GNU",
  },
  {
    title: "Shaykh Hashim Story",
    embedUrl: "https://www.youtube.com/embed/djgMCgDV9EI",
  },
];

export default function JoinPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { signIn, setActive } = useSignIn();
  const router = useRouter();

  const createIntake = useMutation(api.intakes.create);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSupportArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      supportAreas: prev.supportAreas.includes(area)
        ? prev.supportAreas.filter((a) => a !== area)
        : [...prev.supportAreas, area],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        // Name, Gender, City, Journey are required for intake
        // State is optional to reduce friction
        return (
          formData.fullName.length > 0 &&
          formData.gender &&
          formData.city.length > 0 &&
          formData.journeyType
        );
      case 2:
        // Account fields + Consent
        return (
          formData.email.length > 0 &&
          formData.phone.length > 0 &&
          formData.password.length >= 8 &&
          formData.password === formData.confirmPassword &&
          formData.consentGiven
        );
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    setFormError(null);
    setIsSubmitting(true);
    try {
      // Step 1: Create Clerk account
      const nameParts = formData.fullName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || undefined;

      const authRes = await fetch("/api/auth/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName,
          lastName,
        }),
      });
      const authData = await authRes.json();
      if (!authRes.ok && !authData.clerkUserId) {
        setFormError(authData.error || "Failed to create account.");
        return;
      }

      // Step 2: Create intake with real clerkId
      // Note: We pass undefined for optional fields we removed from the UI to match schema expectations
      const intakeId = await createIntake({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender as Gender,
        journeyType: formData.journeyType as JourneyType,
        heardAboutAnsar: formData.heardAboutAnsar || undefined,
        city: formData.city,
        stateRegion: formData.stateRegion, // In UI it's required now, but schema allows optional
        supportAreas: formData.supportAreas,
        otherDetails: formData.otherDetails || undefined,
        returnToIslamReason: formData.returnToIslamReason || undefined,
        consentGiven: formData.consentGiven,
        clerkId: authData.clerkUserId,
        // Optional fields not in 2-step form:
        dateOfBirth: undefined,
        countryOfOrigin: undefined,
        address: undefined, 
      });

      if (!intakeId) {
        setFormError("Your account was created but the intake submission failed. Please sign in and complete the intake form from your portal.");
        return;
      }

      // Step 3: Auto-sign-in and redirect to seeker portal
      try {
        if (signIn) {
          const result = await signIn.create({
            identifier: formData.email,
            password: formData.password,
          });
          if (result.createdSessionId && setActive) {
            await setActive({ session: result.createdSessionId });
            router.push("/seeker");
            return;
          }
        }
      } catch (signInError) {
        console.warn("Auto-sign-in failed, showing success screen:", signInError);
      }

      // Fallback: show success screen if auto-sign-in fails
      setIsSubmitted(true);
    } catch (error: unknown) {
      console.error("Failed to submit:", error);
      const msg = error instanceof Error ? error.message : "Unknown error";
      setFormError(`Something went wrong: ${msg}. Your account was created — you can sign in.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return <SuccessScreen />;
  }

  return (
    <main className="min-h-screen flex flex-col bg-ansar-cream">
      {/* Header */}
      <header className="px-6 md:px-12 py-6">
        <nav className="flex items-center justify-between max-w-3xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-ansar-gray hover:text-ansar-charcoal transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-body text-sm">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full transition-colors ${step >= 1 ? "bg-ansar-terracotta-500" : "bg-ansar-sage-200"}`} />
            <div className={`h-2 w-2 rounded-full transition-colors ${step >= 2 ? "bg-ansar-terracotta-500" : "bg-ansar-sage-200"}`} />
          </div>
        </nav>
      </header>

      {/* Form Content */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-12 py-8">
        <div className="w-full max-w-xl">
          
          {step === 1 && (
            <FormStep 
              title="New Muslims" 
              subtitle="Tell us a bit about yourself so we can find your people."
            >
              <div className="space-y-6">
                
                {/* Basic Info */}
                <div className="grid gap-5">
                  <div>
                    <label className="form-label">First & Last Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder="e.g. Sarah Smith"
                    />
                  </div>

                  <div>
                    <label className="form-label">Gender</label>
                    <p className="font-body text-xs text-ansar-gray-light mb-2">Required for matching you with a Brother or Sister</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        className={`selection-option text-center py-3 ${formData.gender === "male" ? "selected" : ""}`}
                        onClick={() => updateField("gender", "male")}
                      >
                        <span className="font-body">Brother</span>
                      </button>
                      <button
                        type="button"
                        className={`selection-option text-center py-3 ${formData.gender === "female" ? "selected" : ""}`}
                        onClick={() => updateField("gender", "female")}
                      >
                        <span className="font-body">Sister</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="Current city"
                      />
                    </div>
                    <div>
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.stateRegion}
                        onChange={(e) => updateField("stateRegion", e.target.value)}
                        placeholder="State"
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-ansar-sage-100 my-2" />

                {/* Journey */}
                <div>
                  <label className="form-label mb-3">Where are you on your journey?</label>
                  <div className="space-y-3">
                    {journeyOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`selection-option w-full text-left p-4 ${formData.journeyType === option.value ? "selected" : ""}`}
                        onClick={() => updateField("journeyType", option.value)}
                      >
                        <span className="font-heading text-lg block text-ansar-charcoal mb-0.5">{option.label}</span>
                        <span className="font-body text-sm text-ansar-gray">{option.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label">How did you hear about Ansar?</label>
                  <div className="relative">
                    <select
                      className="form-input appearance-none pr-10"
                      value={formData.heardAboutAnsar}
                      onChange={(e) => updateField("heardAboutAnsar", e.target.value)}
                    >
                      <option value="">Select one (optional)</option>
                      {heardAboutOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ArrowRight className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-ansar-gray/50 pointer-events-none" />
                  </div>
                </div>

                {/* Support Areas (Collapsible/Optional feeling) */}
                <div>
                  <label className="form-label mb-3">What&apos;s on your mind? (Select all that apply)</label>
                  <div className="grid gap-2">
                    {supportOptions.slice(0, 4).map((area) => (
                      <label key={area} className="flex items-start gap-3 p-3 rounded-lg border border-transparent hover:bg-white hover:border-ansar-sage-100 transition-all cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.supportAreas.includes(area)}
                          onChange={() => toggleSupportArea(area)}
                          className="mt-1 w-4 h-4 accent-ansar-sage-600 rounded-sm"
                        />
                        <span className="font-body text-sm text-ansar-gray">{area}</span>
                      </label>
                    ))}
                    {/* Simple expand for more? Or just show top ones? Let's show all but compact. */}
                    {supportOptions.slice(4).map((area) => (
                      <label key={area} className="flex items-start gap-3 p-3 rounded-lg border border-transparent hover:bg-white hover:border-ansar-sage-100 transition-all cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.supportAreas.includes(area)}
                          onChange={() => toggleSupportArea(area)}
                          className="mt-1 w-4 h-4 accent-ansar-sage-600 rounded-sm"
                        />
                        <span className="font-body text-sm text-ansar-gray">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </FormStep>
          )}

          {step === 2 && (
            <FormStep 
              title="Activate Your Dashboard" 
              subtitle="Securely save your profile to connect with your mentor."
              icon={<Shield className="w-6 h-6 text-ansar-sage-600" />}
            >
              <div className="space-y-6">
                
                <div className="bg-white/50 border border-ansar-sage-100 rounded-xl p-6 mb-6">
                  <h4 className="font-heading text-lg text-ansar-charcoal mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-ansar-sage-500" />
                    Why create an account?
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 font-body text-sm text-ansar-gray">
                      <Check className="w-4 h-4 text-ansar-sage-500 mt-0.5 shrink-0" />
                      Access your personal dashboard & resources
                    </li>
                    <li className="flex items-start gap-2 font-body text-sm text-ansar-gray">
                      <Check className="w-4 h-4 text-ansar-sage-500 mt-0.5 shrink-0" />
                      Securely message your Ansar (mentor)
                    </li>
                    <li className="flex items-start gap-2 font-body text-sm text-ansar-gray">
                      <Check className="w-4 h-4 text-ansar-sage-500 mt-0.5 shrink-0" />
                      Get invited to local community events & dinners
                    </li>
                  </ul>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                    <p className="form-helper">For text updates on your pairing status.</p>
                  </div>
                  <div>
                    <label className="form-label">Create Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={formData.password}
                      onChange={(e) => { updateField("password", e.target.value); setFormError(null); }}
                      placeholder="Min 8 characters"
                    />
                  </div>
                  <div>
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      placeholder="Re-enter to confirm"
                    />
                  </div>

                  <div>
                    <label className="form-label">Would love to hear your story.</label>
                    <textarea
                      className="form-input min-h-[110px]"
                      value={formData.returnToIslamReason}
                      onChange={(e) => updateField("returnToIslamReason", e.target.value)}
                      placeholder="Share what brought you back to Islam (optional)."
                    />
                    <p className="form-helper">Here are some powerful stories that inspire us.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inspirationVideos.map((video) => (
                      <div
                        key={video.title}
                        className="bg-white/60 border border-ansar-sage-100 rounded-xl overflow-hidden"
                      >
                        <div className="aspect-video bg-ansar-cream">
                          <iframe
                            className="w-full h-full"
                            src={video.embedUrl}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                          />
                        </div>
                        <div className="px-3 py-2">
                          <p className="font-body text-sm text-ansar-charcoal">{video.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-ansar-sage-100 pt-6 mt-2">
                  <label className="flex items-start gap-4 cursor-pointer p-2 -ml-2 rounded-lg hover:bg-white/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.consentGiven}
                      onChange={(e) => updateField("consentGiven", e.target.checked)}
                      className="mt-1 w-5 h-5 accent-ansar-sage-600"
                    />
                    <div className="text-sm">
                      <span className="font-body text-ansar-charcoal font-medium block mb-1">
                        I agree to the <Link href="/terms" className="underline hover:text-ansar-sage-600">Terms</Link> and <Link href="/privacy" className="underline hover:text-ansar-sage-600">Privacy Policy</Link>
                      </span>
                      <span className="font-body text-ansar-gray text-xs">
                        I consent to being contacted by Ansar Family to support my journey. My information will be kept confidential.
                      </span>
                    </div>
                  </label>
                </div>

              </div>
            </FormStep>
          )}

          {/* Inline Error Banner */}
          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-[#fef2f2] border border-[#fecaca] rounded-lg px-4 py-3 flex items-start gap-3"
            >
              <div className="flex-1">
                <p className="font-body text-sm text-ansar-error">{formError}</p>
              </div>
              <button onClick={() => setFormError(null)} className="text-ansar-error/60 hover:text-ansar-error transition-colors shrink-0">
                ×
              </button>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-ansar-sage-100/50">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn-secondary bg-white border border-ansar-terracotta-200 text-ansar-terracotta-700 hover:bg-ansar-terracotta-50 hover:border-ansar-terracotta-300"
              >
                Back
              </button>
            ) : (
              <div /> // Spacer
            )}

            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="btn-primary flex items-center gap-2 shadow-lg shadow-ansar-sage-600/20 disabled:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 shadow-lg shadow-ansar-sage-600/20 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  "Create My Profile & Connect Me"
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}

function FormStep({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: EASE_OUT_QUINT }}
    >
      <div className="flex items-start gap-4 mb-8">
        {icon && (
          <div className="w-12 h-12 bg-ansar-terracotta-100 rounded-xl flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h1 className="font-heading text-3xl text-ansar-charcoal mb-1">
            {title}
          </h1>
          <p className="font-body text-sm text-ansar-gray">
            {subtitle}
          </p>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function SuccessScreen() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-ansar-cream">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE_OUT_QUINT }}
        className="text-center max-w-md bg-white p-8 rounded-2xl shadow-xl border border-white/50"
      >
        <div className="w-16 h-16 bg-ansar-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-ansar-sage-600" />
        </div>
        <h1 className="font-heading text-3xl md:text-4xl text-ansar-charcoal mb-4">
          Welcome to the Family
        </h1>
        <p className="font-body text-ansar-gray mb-6 leading-relaxed">
          Your profile has been securely created. Sign in now to access your dashboard, resources, and track your journey.
        </p>
        <p className="font-body text-sm text-ansar-sage-700 font-medium mb-8 bg-ansar-sage-50 py-2 px-4 rounded-lg inline-block">
          Someone from our team will reach out within 48 hours.
        </p>
        <div className="flex flex-col gap-3 justify-center">
          <Link href="/sign-in" className="btn-primary inline-flex items-center justify-center gap-2 w-full">
            Sign In to Your Portal
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/" className="btn-outline inline-flex items-center justify-center gap-2 w-full border-transparent hover:bg-ansar-cream">
            <ArrowLeft className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
