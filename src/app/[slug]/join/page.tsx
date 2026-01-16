"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2, Building2 } from "lucide-react";

/**
 * PARTNER-SPECIFIC SEEKER INTAKE — Join via Partner
 * 
 * Partner-specific intake form that tags submissions with the partner ID
 * for routing directly to that community's Partner Lead.
 */

type JourneyType = "new_muslim" | "reconnecting" | "seeker";
type Gender = "male" | "female";

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  gender: Gender | "";
  dateOfBirth: string;
  countryOfOrigin: string;
  journeyType: JourneyType | "";
  address: string;
  city: string;
  stateRegion: string;
  supportAreas: string[];
  otherDetails: string;
  consentGiven: boolean;
}

const initialFormData: FormData = {
  fullName: "",
  phone: "",
  email: "",
  gender: "",
  dateOfBirth: "",
  countryOfOrigin: "",
  journeyType: "",
  address: "",
  city: "",
  stateRegion: "",
  supportAreas: [],
  otherDetails: "",
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

export default function PartnerJoinPage() {
  const params = useParams();
  const slug = params.slug as string;

  const organization = useQuery(api.organizations.getBySlug, { slug });

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const createIntake = useMutation(api.intakes.create);

  // Loading state
  if (organization === undefined) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
        <Loader2 className="w-8 h-8 text-ansar-sage-600 animate-spin" />
      </main>
    );
  }

  // Not found
  if (organization === null) {
    notFound();
  }

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
        return formData.fullName && formData.phone && formData.email && formData.gender && formData.dateOfBirth && formData.countryOfOrigin;
      case 2:
        return formData.journeyType;
      case 3:
        return formData.address && formData.city;
      case 4:
        return true;
      case 5:
        return formData.consentGiven;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!formData.consentGiven || !formData.gender || !formData.journeyType) return;

    setIsSubmitting(true);
    try {
      await createIntake({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || undefined,
        countryOfOrigin: formData.countryOfOrigin || undefined,
        journeyType: formData.journeyType,
        address: formData.address || undefined,
        city: formData.city,
        stateRegion: formData.stateRegion || undefined,
        supportAreas: formData.supportAreas,
        otherDetails: formData.otherDetails || undefined,
        consentGiven: formData.consentGiven,
        source: "partner_specific",
        partnerId: organization._id,
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
    return <SuccessScreen orgName={organization.name} slug={slug} />;
  }

  return (
    <main className="min-h-screen flex flex-col bg-ansar-cream">
      {/* Header */}
      <header className="px-6 md:px-12 py-6">
        <nav className="flex items-center justify-between max-w-3xl mx-auto">
          <Link href={`/${slug}`} className="flex items-center gap-2 text-ansar-gray hover:text-ansar-charcoal transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-body text-sm">Back to {organization.name}</span>
          </Link>
          <span className="font-body text-sm text-ansar-gray">
            Step {step} of 5
          </span>
        </nav>
      </header>

      {/* Partner Badge */}
      <div className="px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-ansar-sage-50 px-3 py-1.5 rounded-full mb-4">
            <Building2 className="w-4 h-4 text-ansar-sage-600" />
            <span className="font-body text-xs text-ansar-sage-600">
              Joining via {organization.name}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="h-1 bg-ansar-sage-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-ansar-sage-600"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
            />
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-12 py-12">
        <div className="w-full max-w-xl">
          {step === 1 && (
            <FormStep title="Personal Details" subtitle={`Join ${organization.name}`}>
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
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
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
                  <label className="form-label">Gender *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className={`selection-option ${formData.gender === "male" ? "selected" : ""}`}
                      onClick={() => updateField("gender", "male")}
                    >
                      <span className="font-body">Male</span>
                    </button>
                    <button
                      type="button"
                      className={`selection-option ${formData.gender === "female" ? "selected" : ""}`}
                      onClick={() => updateField("gender", "female")}
                    >
                      <span className="font-body">Female</span>
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
                  <label className="form-label">Country of Origin *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.countryOfOrigin}
                    onChange={(e) => updateField("countryOfOrigin", e.target.value)}
                    placeholder="Where are you from?"
                  />
                </div>
              </div>
            </FormStep>
          )}

          {step === 2 && (
            <FormStep title="Your Background" subtitle="Tell us about your journey">
              <div className="space-y-4">
                {journeyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`selection-option w-full ${formData.journeyType === option.value ? "selected" : ""}`}
                    onClick={() => updateField("journeyType", option.value)}
                  >
                    <span className="font-heading text-lg block mb-1">{option.label}</span>
                    <span className="font-body text-sm text-ansar-gray">{option.description}</span>
                  </button>
                ))}
              </div>
            </FormStep>
          )}

          {step === 3 && (
            <FormStep title="Location" subtitle="This helps us connect you locally">
              <div className="space-y-5">
                <div>
                  <label className="form-label">Full Address *</label>
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
              </div>
            </FormStep>
          )}

          {step === 4 && (
            <FormStep title="What's On Your Mind?" subtitle="Select all that apply (optional)">
              <div className="space-y-3">
                {supportOptions.map((area) => (
                  <button
                    key={area}
                    type="button"
                    className={`selection-option w-full flex items-center justify-between ${formData.supportAreas.includes(area) ? "selected" : ""}`}
                    onClick={() => toggleSupportArea(area)}
                  >
                    <span className="font-body text-sm text-left">{area}</span>
                    {formData.supportAreas.includes(area) && (
                      <Check className="w-5 h-5 text-ansar-sage-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              {formData.supportAreas.includes("Other") && (
                <div className="mt-6">
                  <label className="form-label">Tell us more</label>
                  <textarea
                    className="form-input min-h-[100px]"
                    value={formData.otherDetails}
                    onChange={(e) => updateField("otherDetails", e.target.value)}
                    placeholder="What else is on your mind?"
                  />
                </div>
              )}
            </FormStep>
          )}

          {step === 5 && (
            <FormStep title="What Happens Next" subtitle="Your Connection to the Community">
              <div className="space-y-6">
                <div className="bg-ansar-sage-50 rounded-lg p-6 space-y-4">
                  <p className="font-body text-sm text-ansar-gray mb-4">
                    By clicking submit, you'll be connected directly to <strong>{organization.name}</strong>:
                  </p>
                  <div className="flex gap-4">
                    <span className="font-heading text-ansar-sage-600 text-lg">1.</span>
                    <div>
                      <p className="font-body font-medium text-ansar-charcoal">Local Connection</p>
                      <p className="font-body text-sm text-ansar-gray">The Partner Lead at {organization.name} will reach out within 48 hours</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="font-heading text-ansar-sage-600 text-lg">2.</span>
                    <div>
                      <p className="font-body font-medium text-ansar-charcoal">Your Ansar Match</p>
                      <p className="font-body text-sm text-ansar-gray">You'll be paired with a local Ansar mentor from the community</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="font-heading text-ansar-sage-600 text-lg">3.</span>
                    <div>
                      <p className="font-body font-medium text-ansar-charcoal">Community Dinner</p>
                      <p className="font-body text-sm text-ansar-gray">An invite to the next Monthly Dinner at {organization.name}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-ansar-sage-100 pt-6">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consentGiven}
                      onChange={(e) => updateField("consentGiven", e.target.checked)}
                      className="mt-1 w-5 h-5 accent-ansar-sage-600"
                    />
                    <span className="font-body text-sm text-ansar-gray">
                      I consent to being contacted by {organization.name} and the Ansar Family team 
                      via phone and email to support my journey. I understand my information will be kept confidential.
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
                    Connecting...
                  </>
                ) : (
                  "Connect Me to My Family"
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
      transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
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

function SuccessScreen({ orgName, slug }: { orgName: string; slug: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-ansar-cream">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="text-center max-w-md"
      >
        <div className="w-16 h-16 bg-ansar-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-ansar-sage-600" />
        </div>
        <h1 className="font-heading text-3xl md:text-4xl text-ansar-charcoal mb-4">
          Welcome to the Family
        </h1>
        <p className="font-body text-ansar-gray mb-8">
          Your info has been sent directly to <strong>{orgName}</strong>. Someone from their team 
          will reach out within 48 hours. Until then, you are not alone.
        </p>
        <Link href={`/${slug}`} className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Return to {orgName}
        </Link>
      </motion.div>
    </main>
  );
}
