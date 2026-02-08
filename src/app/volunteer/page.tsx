"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2, Heart } from "lucide-react";

/**
 * ANSAR VOLUNTEER FORM — "Become an Ansar"
 * 
 * Volunteer intake for practicing Muslims who want to provide
 * 1-on-1 mentorship and social support to new Muslims.
 */

const EASE_OUT_QUINT = [0.19, 1, 0.22, 1] as const;

type Gender = "male" | "female";
type PracticeLevel = "consistent" | "steady" | "reconnecting";
type CheckInFrequency = "weekly" | "biweekly" | "monthly";

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: Gender | "";
  dateOfBirth: string;
  address: string;
  city: string;
  stateRegion: string;
  isConvert: boolean | null;
  practiceLevel: PracticeLevel | "";
  knowledgeBackground: string[];
  studyDetails: string;
  experience: string[];
  supportAreas: string[];
  checkInFrequency: CheckInFrequency | "";
  motivation: string;
  // Individual agreements
  agreementKindness: boolean;
  agreementTraining: boolean;
  agreementIntro: boolean;
  agreementVibeCheck: boolean;
}

const initialFormData: FormData = {
  fullName: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  gender: "",
  dateOfBirth: "",
  address: "",
  city: "",
  stateRegion: "",
  isConvert: null,
  practiceLevel: "",
  knowledgeBackground: [],
  studyDetails: "",
  experience: [],
  supportAreas: [],
  checkInFrequency: "",
  motivation: "",
  agreementKindness: false,
  agreementTraining: false,
  agreementIntro: false,
  agreementVibeCheck: false,
};

const knowledgeOptions = [
  { value: "general", label: "General Community Knowledge", description: "Foundational understanding through local classes and personal study" },
  { value: "hafiz", label: "Specialized Skill (Hafiz/Hafiza)", description: "I have memorized parts/all of the Quran and can assist with recitation" },
  { value: "formal", label: "Formal Student of Knowledge", description: "Currently enrolled in or completed a structured program" },
  { value: "leadership", label: "Leadership or Instructional Role", description: "I serve or have served as an Imam, Khatib, or recognized teacher" },
  { value: "advanced", label: "Advanced Scholarly Study", description: "I hold a degree in Sharia/Usul al-Din or have Ijazahs" },
];

const experienceOptions = [
  "Tabligh / Outreach",
  "Dawah / New Muslim Support",
  "MSA / Youth Leadership",
  "Social Work / Counseling / Mental Health",
  "Professional Mentoring / Career Coaching",
];

const supportAreaOptions = [
  { value: "social", label: "Social", description: "Coffee meetups, grocery shopping, or just hanging out" },
  { value: "logistics", label: "Logistics", description: "Giving rides to the Masjid or community events" },
  { value: "knowledge", label: "Knowledge", description: "Teaching the basics (Wudu, Salah, etc.)" },
  { value: "hospitality", label: "Hospitality", description: "Cooking or hosting small gatherings" },
];

const practiceLevelOptions: { value: PracticeLevel; label: string; description: string }[] = [
  {
    value: "consistent",
    label: "Consistent",
    description: "I pray 5 times daily and feel comfortable modeling the basics (Wudu, Salah, etc.) to a beginner.",
  },
  {
    value: "steady",
    label: "Steady",
    description: "I pray 5 times daily and am active in the community, but I prefer to focus on social support rather than teaching.",
  },
  {
    value: "reconnecting",
    label: "Reconnecting / Peer Support",
    description: "I am currently strengthening my own daily practice, but I can offer strong empathy and friendship to someone new.",
  },
];

const checkInFrequencyOptions: { value: CheckInFrequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
];

export default function VolunteerPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const createAnsar = useMutation(api.ansars.create);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: "knowledgeBackground" | "experience" | "supportAreas", value: string) => {
    setFormData((prev) => {
      const current = prev[field];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const allAgreementsAccepted = formData.agreementKindness && formData.agreementTraining && formData.agreementIntro && formData.agreementVibeCheck;

  const canProceed = () => {
    switch (step) {
      case 1:
        return (
          formData.fullName &&
          formData.phone &&
          formData.email &&
          formData.password.length >= 8 &&
          formData.password === formData.confirmPassword &&
          formData.gender &&
          formData.dateOfBirth &&
          formData.address &&
          formData.city &&
          formData.isConvert !== null
        );
      case 2:
        return formData.practiceLevel && formData.knowledgeBackground.length > 0;
      case 3:
        return formData.experience.length > 0 && formData.supportAreas.length > 0;
      case 4:
        return formData.checkInFrequency && formData.motivation && allAgreementsAccepted;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!formData.gender || !formData.practiceLevel || !formData.checkInFrequency || formData.isConvert === null || !allAgreementsAccepted) return;

    setFormError(null);
    if (formData.password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

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
      if (!authRes.ok) {
        setFormError(authData.error || "Failed to create account.");
        return;
      }

      // Step 2: Create ansar application with real clerkId
      await createAnsar({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || undefined,
        address: formData.address,
        city: formData.city,
        stateRegion: formData.stateRegion || undefined,
        isConvert: formData.isConvert,
        practiceLevel: formData.practiceLevel,
        knowledgeBackground: formData.knowledgeBackground,
        studyDetails: formData.studyDetails || undefined,
        experience: formData.experience,
        supportAreas: formData.supportAreas,
        checkInFrequency: formData.checkInFrequency,
        motivation: formData.motivation,
        agreementsAccepted: allAgreementsAccepted,
        clerkId: authData.clerkUserId,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit:", error);
      setFormError("Something went wrong. Please try again.");
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
          <span className="font-body text-sm text-ansar-gray">
            Step {step} of 4
          </span>
        </nav>
      </header>

      {/* Progress Bar */}
      <div className="px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="h-1 bg-ansar-sage-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-ansar-sage-600"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3, ease: EASE_OUT_QUINT }}
            />
          </div>
        </div>
      </div>

      {/* Intro Text (First step only) */}
      {step === 1 && (
        <div className="px-6 md:px-12 mt-8">
          <div className="max-w-xl mx-auto text-center">
            <p className="font-body text-sm text-ansar-gray">
              Ansar Family is a platform that pairs practicing Muslims with those who are new to Islam or reconnecting with their faith, so no one walks this path alone. We are looking for brothers and sisters who can offer in-person support rooted in sincerity, presence, and good company.
            </p>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-12 py-12">
        <div className="w-full max-w-xl">
          {step === 1 && (
            <FormStep title="About You" subtitle="Become an Ansar">
              <div className="space-y-5">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="form-label">Gender *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className={`selection-option ${formData.gender === "male" ? "selected" : ""}`}
                      onClick={() => updateField("gender", "male")}
                    >
                      <span className="font-body">Brother</span>
                    </button>
                    <button
                      type="button"
                      className={`selection-option ${formData.gender === "female" ? "selected" : ""}`}
                      onClick={() => updateField("gender", "female")}
                    >
                      <span className="font-body">Sister</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="form-label">Date of Birth *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                  <p className="form-helper">We will send you a quick text to say hello!</p>
                </div>
                <div>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="form-label">Create Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    value={formData.password}
                    onChange={(e) => { updateField("password", e.target.value); setFormError(null); }}
                    placeholder="Minimum 8 characters"
                    minLength={8}
                  />
                  <p className="text-[11px] text-ansar-muted mt-1.5 font-body">
                    Use 8+ characters with a mix of letters, numbers &amp; symbols. Avoid common passwords.
                  </p>
                  {formData.password && formData.password.length < 8 && (
                    <p className="text-xs text-ansar-terracotta mt-1 font-body">Must be at least 8 characters</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Confirm Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    placeholder="Re-enter your password"
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-ansar-terracotta mt-1 font-body">Passwords do not match</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Full Address *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="Street address"
                  />
                  <p className="form-helper">We use this to match you with someone nearby for in-person connection.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="Your city"
                    />
                  </div>
                  <div>
                    <label className="form-label">State / Region</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.stateRegion}
                      onChange={(e) => updateField("stateRegion", e.target.value)}
                      placeholder="State"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Are you a convert yourself? *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className={`selection-option ${formData.isConvert === true ? "selected" : ""}`}
                      onClick={() => updateField("isConvert", true)}
                    >
                      <span className="font-body">Yes</span>
                    </button>
                    <button
                      type="button"
                      className={`selection-option ${formData.isConvert === false ? "selected" : ""}`}
                      onClick={() => updateField("isConvert", false)}
                    >
                      <span className="font-body">No</span>
                    </button>
                  </div>
                </div>
              </div>
            </FormStep>
          )}

          {step === 2 && (
            <FormStep title="Islamic Practice & Knowledge" subtitle="Your Foundation">
              <p className="font-body text-sm text-ansar-gray mb-6">
                We don&apos;t expect everyone to be a scholar. Most newcomers just need a friend. This section helps us route specific questions to the right people.
              </p>
              <div className="space-y-6">
                <div>
                  <label className="form-label">Practice Level *</label>
                  <div className="space-y-3">
                    {practiceLevelOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`selection-option w-full ${formData.practiceLevel === option.value ? "selected" : ""}`}
                        onClick={() => updateField("practiceLevel", option.value)}
                      >
                        <span className="font-heading text-lg block mb-1">{option.label}</span>
                        <span className="font-body text-sm text-ansar-gray">{option.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label">Learning Background *</label>
                  <p className="font-body text-xs text-ansar-gray-light mb-3">Select all that apply</p>
                  <div className="space-y-2">
                    {knowledgeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`selection-option w-full flex items-center justify-between ${formData.knowledgeBackground.includes(option.value) ? "selected" : ""}`}
                        onClick={() => toggleArrayField("knowledgeBackground", option.value)}
                      >
                        <div className="text-left">
                          <span className="font-body block">{option.label}</span>
                          <span className="font-body text-xs text-ansar-gray-light">{option.description}</span>
                        </div>
                        {formData.knowledgeBackground.includes(option.value) && (
                          <Check className="w-5 h-5 text-ansar-sage-600 flex-shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label">Additional Context (Optional)</label>
                  <textarea
                    className="form-input min-h-[100px]"
                    value={formData.studyDetails}
                    onChange={(e) => updateField("studyDetails", e.target.value)}
                    placeholder="If you have studied at a specific institute or under specific teachers, share that here..."
                  />
                </div>
              </div>
            </FormStep>
          )}

          {step === 3 && (
            <FormStep title="Experience & Skills" subtitle="What You Bring">
              <div className="space-y-6">
                <div>
                  <label className="form-label">Prior Experience *</label>
                  <p className="font-body text-xs text-ansar-gray-light mb-3">Select all that apply</p>
                  <div className="space-y-2">
                    {experienceOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`selection-option w-full flex items-center justify-between ${formData.experience.includes(option) ? "selected" : ""}`}
                        onClick={() => toggleArrayField("experience", option)}
                      >
                        <span className="font-body">{option}</span>
                        {formData.experience.includes(option) && (
                          <Check className="w-5 h-5 text-ansar-sage-600 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label">Support Areas *</label>
                  <p className="font-body text-xs text-ansar-gray-light mb-3">How would you like to help?</p>
                  <div className="space-y-2">
                    {supportAreaOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`selection-option w-full flex items-center justify-between ${formData.supportAreas.includes(option.value) ? "selected" : ""}`}
                        onClick={() => toggleArrayField("supportAreas", option.value)}
                      >
                        <div className="text-left">
                          <span className="font-body font-medium">{option.label}</span>
                          <span className="font-body text-sm text-ansar-gray block">{option.description}</span>
                        </div>
                        {formData.supportAreas.includes(option.value) && (
                          <Check className="w-5 h-5 text-ansar-sage-600 flex-shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </FormStep>
          )}

          {step === 4 && (
            <FormStep title="Commitment & The Ansar Way" subtitle="Your Commitment">
              <div className="space-y-6">
                <div>
                  <label className="form-label">Check-In Frequency *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {checkInFrequencyOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`selection-option text-center ${formData.checkInFrequency === option.value ? "selected" : ""}`}
                        onClick={() => updateField("checkInFrequency", option.value)}
                      >
                        <span className="font-body">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label">Why do you want to support someone on their faith journey? *</label>
                  <textarea
                    className="form-input min-h-[120px]"
                    value={formData.motivation}
                    onChange={(e) => updateField("motivation", e.target.value)}
                    placeholder="Share your heart..."
                  />
                </div>

                <div className="bg-ansar-sage-50 rounded-lg p-4 mb-4">
                  <p className="font-body text-sm text-ansar-sage-700 font-medium">
                    The Goal: We ask for a 90-day intentional friendship with your mentee.
                  </p>
                </div>

                <div className="border-t border-ansar-sage-100 pt-6">
                  <label className="form-label mb-4">The &quot;Ansar Way&quot; Agreement</label>
                  <p className="font-body text-xs text-ansar-gray-light mb-4">All agreements are required</p>
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreementKindness}
                        onChange={(e) => updateField("agreementKindness", e.target.checked)}
                        className="mt-1 w-5 h-5 accent-ansar-sage-600"
                      />
                      <span className="font-body text-sm text-ansar-charcoal">
                        I agree to treat my mentee with kindness, confidentiality, and consistency.
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreementTraining}
                        onChange={(e) => updateField("agreementTraining", e.target.checked)}
                        className="mt-1 w-5 h-5 accent-ansar-sage-600"
                      />
                      <span className="font-body text-sm text-ansar-charcoal">
                        I agree to complete the <strong>10-minute &quot;Ansar Way&quot; training</strong> before being paired.
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreementIntro}
                        onChange={(e) => updateField("agreementIntro", e.target.checked)}
                        className="mt-1 w-5 h-5 accent-ansar-sage-600"
                      />
                      <span className="font-body text-sm text-ansar-charcoal">
                        I agree to a <strong>3-way introductory text</strong> from my Partner Lead to start the connection.
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreementVibeCheck}
                        onChange={(e) => updateField("agreementVibeCheck", e.target.checked)}
                        className="mt-1 w-5 h-5 accent-ansar-sage-600"
                      />
                      <span className="font-body text-sm text-ansar-charcoal">
                        I agree to be contacted once a month by Ansar Family Central for a &quot;Vibe Check&quot; to see how I&apos;m doing.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </FormStep>
          )}

          {/* Inline Error Banner */}
          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-[#fef2f2] border border-[#fecaca] rounded-xl px-4 py-3 flex items-start gap-3"
            >
              <span className="text-ansar-error mt-0.5 shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="currentColor" fillOpacity="0.15" /><path d="M8 4.5v4M8 10.5h.007" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </span>
              <div className="flex-1">
                <p className="font-body text-sm text-ansar-error">{formError}</p>
              </div>
              <button onClick={() => setFormError(null)} className="text-ansar-error/60 hover:text-ansar-error transition-colors shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn-secondary"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit My Application"
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
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: EASE_OUT_QUINT }}
    >
      <p className="font-body text-sm text-ansar-sage-600 mb-2">
        {subtitle}
      </p>
      <h1 className="font-heading text-3xl md:text-4xl text-ansar-charcoal mb-8">
        {title}
      </h1>
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
        className="text-center max-w-md"
      >
        <div className="w-16 h-16 bg-ansar-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-8 h-8 text-ansar-sage-600" />
        </div>
        <h1 className="font-heading text-3xl md:text-4xl text-ansar-charcoal mb-4">
          Thank You
        </h1>
        <p className="font-body text-ansar-gray mb-4">
          Your application has been received and your account has been created.
        </p>
        <p className="font-body text-sm text-ansar-gray mb-4">
          You can sign in now to check your application status.
          Once approved by your Hub Admin, you&apos;ll have full access to the Ansar portal.
        </p>
        <p className="font-body text-sm text-ansar-sage-600 mb-6">
          May Allah reward you for your intention.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/sign-in" className="btn-primary inline-flex items-center justify-center gap-2">
            Sign In to Your Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/" className="btn-secondary inline-flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
