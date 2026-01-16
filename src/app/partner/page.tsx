"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2, Building2 } from "lucide-react";

/**
 * PARTNER HUB APPLICATION — "Register Your Community"
 * 
 * Entry point for Masjids, MSAs, and other communities to become
 * official Partner Hubs in the Ansar Family network.
 */

const EASE_OUT_QUINT = [0.19, 1, 0.22, 1] as const;

type OrgType = "masjid" | "msa" | "nonprofit" | "informal_circle" | "other";
type GenderFocus = "brothers" | "sisters" | "both";

interface Infrastructure {
  hasWeeklyProgramming: boolean;
  canHostNewMuslimSessions: boolean;
  hasImamAccess: boolean;
  hasExistingNewMuslimProgram: boolean;
  wantsDinnerKit: boolean;
  hasPhysicalSpace: boolean;
}

interface CoreTrio {
  imamName: string;
  imamPhone: string;
  imamEmail: string;
  secondName: string;
  secondPhone: string;
  secondEmail: string;
}

interface FormData {
  // Partner Lead
  leadName: string;
  leadPhone: string;
  leadEmail: string;
  leadIsConvert: boolean | null;

  // Organization
  orgName: string;
  orgType: OrgType | "";
  orgTypeOther: string;
  address: string;
  city: string;
  stateRegion: string;
  genderFocus: GenderFocus | "";

  // Infrastructure
  infrastructure: Infrastructure;

  // Core Trio
  coreTrio: CoreTrio;

  // Agreements
  agreementSinglePoint: boolean;
  agreementMonthlyDinner: boolean;
  agreementVibeCheck: boolean;
  agreementTraining: boolean;
}

const initialFormData: FormData = {
  leadName: "",
  leadPhone: "",
  leadEmail: "",
  leadIsConvert: null,
  orgName: "",
  orgType: "",
  orgTypeOther: "",
  address: "",
  city: "",
  stateRegion: "",
  genderFocus: "",
  infrastructure: {
    hasWeeklyProgramming: false,
    canHostNewMuslimSessions: false,
    hasImamAccess: false,
    hasExistingNewMuslimProgram: false,
    wantsDinnerKit: false,
    hasPhysicalSpace: false,
  },
  coreTrio: {
    imamName: "",
    imamPhone: "",
    imamEmail: "",
    secondName: "",
    secondPhone: "",
    secondEmail: "",
  },
  agreementSinglePoint: false,
  agreementMonthlyDinner: false,
  agreementVibeCheck: false,
  agreementTraining: false,
};

const orgTypeOptions: { value: OrgType; label: string }[] = [
  { value: "masjid", label: "Masjid / Islamic Center" },
  { value: "msa", label: "MSA / Student Organization" },
  { value: "nonprofit", label: "Nonprofit / Social Enterprise" },
  { value: "informal_circle", label: "Informal Halaqa Circle" },
  { value: "other", label: "Other" },
];

const infrastructureQuestions: { key: keyof Infrastructure; question: string; description: string }[] = [
  {
    key: "hasWeeklyProgramming",
    question: "Weekly Programming",
    description: "Does your community have regular weekly classes, halaqas, or gatherings?",
  },
  {
    key: "canHostNewMuslimSessions",
    question: "Host New Muslim Sessions",
    description: "Can you host dedicated sessions (e.g., monthly dinner) specifically for new Muslims?",
  },
  {
    key: "hasImamAccess",
    question: "Imam/Scholar Access",
    description: "Do you have an Imam or scholar available to answer questions and provide guidance?",
  },
  {
    key: "hasExistingNewMuslimProgram",
    question: "Existing Program",
    description: "Do you already have an active new Muslim support program?",
  },
  {
    key: "hasPhysicalSpace",
    question: "Physical Space",
    description: "Do you have access to physical space for gatherings and events?",
  },
];

function calculateHubLevel(infrastructure: Infrastructure): number {
  const points = [
    infrastructure.hasWeeklyProgramming,
    infrastructure.canHostNewMuslimSessions,
    infrastructure.hasImamAccess,
    infrastructure.hasExistingNewMuslimProgram,
    infrastructure.hasPhysicalSpace,
  ].filter(Boolean).length;

  if (points === 5) return 5;
  if (points === 4) return 4;
  if (points >= 3) return 3;
  if (points >= 1) return 2;
  return 1;
}

const hubLevelDescriptions: Record<number, { title: string; description: string }> = {
  1: { title: "Seed Hub", description: "Starting from scratch — we'll help you build" },
  2: { title: "Emerging Hub", description: "Foundation in place — ready to grow" },
  3: { title: "Growing Hub", description: "Solid infrastructure — scaling support" },
  4: { title: "Advanced Hub", description: "Most services available — refining operations" },
  5: { title: "Full-Service Hub", description: "Complete infrastructure — model community" },
};

export default function PartnerPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hubLevel, setHubLevel] = useState(1);

  const createPartner = useMutation(api.partners.create);

  // Recalculate hub level when infrastructure changes
  useEffect(() => {
    setHubLevel(calculateHubLevel(formData.infrastructure));
  }, [formData.infrastructure]);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateInfrastructure = (key: keyof Infrastructure, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      infrastructure: { ...prev.infrastructure, [key]: value },
    }));
  };

  const updateCoreTrio = (key: keyof CoreTrio, value: string) => {
    setFormData((prev) => ({
      ...prev,
      coreTrio: { ...prev.coreTrio, [key]: value },
    }));
  };

  const allAgreementsAccepted =
    formData.agreementSinglePoint &&
    formData.agreementMonthlyDinner &&
    formData.agreementVibeCheck &&
    formData.agreementTraining;

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.leadName && formData.leadPhone && formData.leadEmail && formData.leadIsConvert !== null;
      case 2:
        return formData.orgName && formData.orgType && formData.address && formData.city && formData.genderFocus;
      case 3:
        return true; // Infrastructure is all boolean, always valid
      case 4:
        return true; // Core Trio is optional
      case 5:
        return allAgreementsAccepted;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!formData.orgType || !formData.genderFocus || formData.leadIsConvert === null || !allAgreementsAccepted) return;

    setIsSubmitting(true);
    try {
      await createPartner({
        leadName: formData.leadName,
        leadPhone: formData.leadPhone,
        leadEmail: formData.leadEmail,
        leadIsConvert: formData.leadIsConvert,
        orgName: formData.orgName,
        orgType: formData.orgType,
        orgTypeOther: formData.orgTypeOther || undefined,
        address: formData.address,
        city: formData.city,
        stateRegion: formData.stateRegion || undefined,
        genderFocus: formData.genderFocus,
        infrastructure: formData.infrastructure,
        coreTrio: {
          imamName: formData.coreTrio.imamName || undefined,
          imamPhone: formData.coreTrio.imamPhone || undefined,
          imamEmail: formData.coreTrio.imamEmail || undefined,
          secondName: formData.coreTrio.secondName || undefined,
          secondPhone: formData.coreTrio.secondPhone || undefined,
          secondEmail: formData.coreTrio.secondEmail || undefined,
        },
        agreementsAccepted: allAgreementsAccepted,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return <SuccessScreen orgName={formData.orgName} hubLevel={hubLevel} />;
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
            Step {step} of 5
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
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.3, ease: EASE_OUT_QUINT }}
            />
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-12 py-12">
        <div className="w-full max-w-xl">
          {step === 1 && (
            <FormStep title="Partner Lead" subtitle="Register Your Community">
              <p className="font-body text-sm text-ansar-gray mb-6">
                You will be the primary point of contact between your community and Ansar Family Central.
              </p>
              <div className="space-y-5">
                <div>
                  <label className="form-label">Your Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.leadName}
                    onChange={(e) => updateField("leadName", e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.leadPhone}
                    onChange={(e) => updateField("leadPhone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.leadEmail}
                    onChange={(e) => updateField("leadEmail", e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="form-label">Are you a convert yourself? *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className={`selection-option ${formData.leadIsConvert === true ? "selected" : ""}`}
                      onClick={() => updateField("leadIsConvert", true)}
                    >
                      <span className="font-body">Yes</span>
                    </button>
                    <button
                      type="button"
                      className={`selection-option ${formData.leadIsConvert === false ? "selected" : ""}`}
                      onClick={() => updateField("leadIsConvert", false)}
                    >
                      <span className="font-body">No</span>
                    </button>
                  </div>
                </div>
              </div>
            </FormStep>
          )}

          {step === 2 && (
            <FormStep title="Organization Identity" subtitle="About Your Community">
              <div className="space-y-5">
                <div>
                  <label className="form-label">Organization Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.orgName}
                    onChange={(e) => updateField("orgName", e.target.value)}
                    placeholder="e.g., Masjid al-Noor, Berkeley MSA"
                  />
                </div>
                <div>
                  <label className="form-label">Organization Type *</label>
                  <div className="space-y-2">
                    {orgTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`selection-option w-full ${formData.orgType === option.value ? "selected" : ""}`}
                        onClick={() => updateField("orgType", option.value)}
                      >
                        <span className="font-body">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {formData.orgType === "other" && (
                  <div>
                    <label className="form-label">Please specify</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.orgTypeOther}
                      onChange={(e) => updateField("orgTypeOther", e.target.value)}
                      placeholder="Describe your organization type"
                    />
                  </div>
                )}
                <div>
                  <label className="form-label">Address *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="City"
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
                  <label className="form-label">Gender Focus *</label>
                  <p className="font-body text-xs text-ansar-gray-light mb-3">Does your community primarily serve brothers, sisters, or both?</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      className={`selection-option text-center ${formData.genderFocus === "brothers" ? "selected" : ""}`}
                      onClick={() => updateField("genderFocus", "brothers")}
                    >
                      <span className="font-body">Brothers</span>
                    </button>
                    <button
                      type="button"
                      className={`selection-option text-center ${formData.genderFocus === "sisters" ? "selected" : ""}`}
                      onClick={() => updateField("genderFocus", "sisters")}
                    >
                      <span className="font-body">Sisters</span>
                    </button>
                    <button
                      type="button"
                      className={`selection-option text-center ${formData.genderFocus === "both" ? "selected" : ""}`}
                      onClick={() => updateField("genderFocus", "both")}
                    >
                      <span className="font-body">Both</span>
                    </button>
                  </div>
                </div>
              </div>
            </FormStep>
          )}

          {step === 3 && (
            <FormStep title="Infrastructure & Services" subtitle="Your Hub Level">
              <p className="font-body text-sm text-ansar-gray mb-6">
                Answer honestly — there's no wrong level. We tailor our support to meet you where you are.
              </p>

              {/* Hub Level Display */}
              <div className="bg-ansar-sage-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body text-sm text-ansar-sage-600">Your Hub Level</span>
                  <span className="font-heading text-2xl text-ansar-sage-700">Level {hubLevel}</span>
                </div>
                <p className="font-heading text-lg text-ansar-charcoal">{hubLevelDescriptions[hubLevel].title}</p>
                <p className="font-body text-sm text-ansar-gray">{hubLevelDescriptions[hubLevel].description}</p>
              </div>

              <div className="space-y-4">
                {infrastructureQuestions.map((q) => (
                  <div
                    key={q.key}
                    className={`selection-option flex items-center justify-between ${formData.infrastructure[q.key] ? "selected" : ""}`}
                    onClick={() => updateInfrastructure(q.key, !formData.infrastructure[q.key])}
                  >
                    <div className="text-left">
                      <span className="font-body font-medium block">{q.question}</span>
                      <span className="font-body text-sm text-ansar-gray">{q.description}</span>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-4 transition-colors ${
                        formData.infrastructure[q.key]
                          ? "bg-ansar-sage-600 border-ansar-sage-600"
                          : "border-ansar-sage-300"
                      }`}
                    >
                      {formData.infrastructure[q.key] && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                ))}

                <div className="border-t border-ansar-sage-100 pt-4 mt-4">
                  <div
                    className={`selection-option flex items-center justify-between ${formData.infrastructure.wantsDinnerKit ? "selected" : ""}`}
                    onClick={() => updateInfrastructure("wantsDinnerKit", !formData.infrastructure.wantsDinnerKit)}
                  >
                    <div className="text-left">
                      <span className="font-body font-medium block">Monthly Dinner Kit</span>
                      <span className="font-body text-sm text-ansar-gray">
                        Would you like to receive our dinner hosting kit (recipes, conversation guides, etc.)?
                      </span>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-4 transition-colors ${
                        formData.infrastructure.wantsDinnerKit
                          ? "bg-ansar-sage-600 border-ansar-sage-600"
                          : "border-ansar-sage-300"
                      }`}
                    >
                      {formData.infrastructure.wantsDinnerKit && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </div>
              </div>
            </FormStep>
          )}

          {step === 4 && (
            <FormStep title="Core Trio" subtitle="Your Support Team (Optional)">
              <p className="font-body text-sm text-ansar-gray mb-6">
                The "Core Trio" is you + an Imam/Scholar + one other committed person. This team handles local pairings and escalations.
                You can add these later if you don't have them yet.
              </p>

              <div className="space-y-6">
                <div className="bg-ansar-sage-50 rounded-lg p-4">
                  <h3 className="font-heading text-lg text-ansar-charcoal mb-4">Imam / Scholar (Optional)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.coreTrio.imamName}
                        onChange={(e) => updateCoreTrio("imamName", e.target.value)}
                        placeholder="Imam's name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-input"
                          value={formData.coreTrio.imamPhone}
                          onChange={(e) => updateCoreTrio("imamPhone", e.target.value)}
                          placeholder="Phone"
                        />
                      </div>
                      <div>
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-input"
                          value={formData.coreTrio.imamEmail}
                          onChange={(e) => updateCoreTrio("imamEmail", e.target.value)}
                          placeholder="Email"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-ansar-sage-50 rounded-lg p-4">
                  <h3 className="font-heading text-lg text-ansar-charcoal mb-4">Second Support Person (Optional)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.coreTrio.secondName}
                        onChange={(e) => updateCoreTrio("secondName", e.target.value)}
                        placeholder="Name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-input"
                          value={formData.coreTrio.secondPhone}
                          onChange={(e) => updateCoreTrio("secondPhone", e.target.value)}
                          placeholder="Phone"
                        />
                      </div>
                      <div>
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-input"
                          value={formData.coreTrio.secondEmail}
                          onChange={(e) => updateCoreTrio("secondEmail", e.target.value)}
                          placeholder="Email"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FormStep>
          )}

          {step === 5 && (
            <FormStep title="Commitment" subtitle="The Partnership Agreement">
              <div className="space-y-6">
                <div className="bg-ansar-sage-50 rounded-lg p-6">
                  <p className="font-body text-sm text-ansar-gray">
                    By becoming a Partner Hub, you're joining a network of communities committed to supporting new Muslims.
                    Here's what we ask of you:
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreementSinglePoint}
                      onChange={(e) => updateField("agreementSinglePoint", e.target.checked)}
                      className="mt-1 w-5 h-5 accent-ansar-sage-600"
                    />
                    <span className="font-body text-sm text-ansar-charcoal">
                      I agree to serve as the <strong>single point of contact</strong> between my community and Ansar Family Central.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreementMonthlyDinner}
                      onChange={(e) => updateField("agreementMonthlyDinner", e.target.checked)}
                      className="mt-1 w-5 h-5 accent-ansar-sage-600"
                    />
                    <span className="font-body text-sm text-ansar-charcoal">
                      I commit to hosting or organizing a <strong>monthly community dinner</strong> for new Muslims (we'll send the kit!).
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
                      I agree to participate in a <strong>monthly "Vibe Check"</strong> call with Ansar Family Central.
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
                      I agree to complete the <strong>Partner Lead Training</strong> (15 min) before onboarding.
                    </span>
                  </label>
                </div>
              </div>
            </FormStep>
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

            {step < 5 ? (
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
                  "Submit Application"
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

function SuccessScreen({ orgName, hubLevel }: { orgName: string; hubLevel: number }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-ansar-cream">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE_OUT_QUINT }}
        className="text-center max-w-md"
      >
        <div className="w-16 h-16 bg-ansar-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-8 h-8 text-ansar-sage-600" />
        </div>
        <h1 className="font-heading text-3xl md:text-4xl text-ansar-charcoal mb-4">
          Welcome to the Network
        </h1>
        <p className="font-body text-ansar-gray mb-4">
          <strong>{orgName}</strong> has been registered as a <strong>Level {hubLevel} Hub</strong>.
        </p>
        <p className="font-body text-sm text-ansar-gray mb-8">
          Our team will review your application and reach out within 48 hours to complete your onboarding.
          We're excited to partner with you.
        </p>
        <Link href="/" className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Return Home
        </Link>
      </motion.div>
    </main>
  );
}
