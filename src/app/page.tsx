"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import GardenAnimation from "@/components/GardenAnimation";

const PATH_CARDS = [
  {
    title: "I am here to Learn",
    subtitle: "For New & Reconnecting Muslims",
    description: [
      "Get access to clear, step-by-step learning resources instantly.",
      "We'll help you on your journey every step of the way.",
      "Connect with your community.",
    ],
    href: "/join",
    cta: "Start My Journey",
    blooms: 1,
    bloomLayout: "cluster" as const,
  },
  {
    title: "I am here to Help",
    subtitle: "Become a Helper",
    description: [
      "Want to support new Muslims?",
      "Get expert mentor training on how to provide effective support.",
      "Be the welcoming presence for your local community.",
    ],
    href: "/volunteer",
    cta: "Become a Helper",
    blooms: 2,
    bloomLayout: "cluster" as const,
  },
  {
    title: "We are here to be a Partner Organization",
    subtitle: "Register your Organization, Masjid, MSA",
    description: [
      "Get a free digital toolkit (Community Dashboard, Communication, & Event Setup).",
      "Your converts + ansars get instant access to our expert-made training.",
      "Connect your community to our global network.",
    ],
    href: "/partner",
    cta: "Become a Partner Hub",
    blooms: 3,
    bloomLayout: "row" as const,
  },
];

function FlowerGlyph({ x, y, scale = 1, tone = "terracotta" }: { x: number; y: number; scale?: number; tone?: "terracotta" | "ochre" }) {
  const petalA = tone === "terracotta" ? "petal-terracotta" : "petal-ochre";
  const petalB = tone === "terracotta" ? "petal-terracotta-light" : "petal-ochre-dark";
  const center = tone === "terracotta" ? "flower-center-dark" : "flower-center";

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse className={petalA} cx="0" cy="-6" rx="4" ry="7" />
      <ellipse className={petalB} cx="5.5" cy="-2" rx="4" ry="7" transform="rotate(35 5.5 -2)" />
      <ellipse className={petalA} cx="-5.5" cy="-2" rx="4" ry="7" transform="rotate(-35 -5.5 -2)" />
      <ellipse className={petalB} cx="4.5" cy="4.5" rx="4" ry="7" transform="rotate(70 4.5 4.5)" />
      <ellipse className={petalA} cx="-4.5" cy="4.5" rx="4" ry="7" transform="rotate(-70 -4.5 4.5)" />
      <circle className={center} cx="0" cy="0.5" r="2.8" />
    </g>
  );
}

function FlowerClusterIcon({ blooms, layout = "cluster" }: { blooms: number; layout?: "cluster" | "row" }) {
  if (layout === "row") {
    return (
      <svg viewBox="0 0 180 50" className="w-36 md:w-44 h-auto" aria-hidden="true">
        {Array.from({ length: blooms }).map((_, index) => (
          <FlowerGlyph
            key={`row-bloom-${index}`}
            x={14 + index * 26}
            y={26}
            scale={0.9}
            tone={index % 2 === 0 ? "terracotta" : "ochre"}
          />
        ))}
      </svg>
    );
  }

  if (blooms === 2) {
    return (
      <svg viewBox="0 0 70 56" className="w-16 h-16 md:w-20 md:h-20" aria-hidden="true">
        <FlowerGlyph x={24} y={30} scale={0.9} tone="terracotta" />
        <FlowerGlyph x={46} y={30} scale={0.9} tone="ochre" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 56 56" className="w-16 h-16 md:w-20 md:h-20" aria-hidden="true">
      {blooms >= 1 && <FlowerGlyph x={28} y={29} scale={1} tone="terracotta" />}
      {blooms >= 2 && <FlowerGlyph x={17} y={35} scale={0.72} tone="ochre" />}
      {blooms >= 3 && <FlowerGlyph x={38} y={35} scale={0.72} tone="ochre" />}
      {blooms >= 4 && <FlowerGlyph x={28} y={16} scale={0.62} tone="terracotta" />}
    </svg>
  );
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-ansar-cream selection:bg-ansar-sage-200 selection:text-ansar-charcoal relative overflow-x-hidden flex flex-col font-body">

      {/* ========================================
          HERO SECTION
          ======================================== */}
      <section className="relative w-full min-h-screen flex flex-col justify-between">
        {/* Navbar */}
        <header className="relative w-full flex items-center justify-between px-6 md:px-8 py-6 md:py-8 z-50">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center"
          >
            <Link href="/" className="block hover:opacity-80 transition-opacity">
              <Image
                src="/images/accents/Slide cover (1).png"
                alt="ansar family"
                width={360}
                height={80}
                className="h-16 md:h-20 w-auto object-contain object-left"
                priority
              />
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            className="flex items-center gap-6"
          >
            <a href="#story" className="hidden md:inline font-body text-sm text-ansar-charcoal/70 hover:text-ansar-charcoal transition-colors">
              Our Story
            </a>
            <Link href="/sign-in" className="font-body text-xs uppercase tracking-widest bg-ansar-terracotta-700 text-ansar-cream px-4 py-2 rounded-lg hover:bg-ansar-terracotta-800 transition-colors duration-200">
              Login
            </Link>
          </motion.div>
        </header>

        {/* Hero Content — Split Layout */}
        <div className="flex-1 flex items-center px-6 md:px-8 lg:px-16 relative z-10">
          <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-20 items-center">

            {/* LEFT: Typography + Form */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="w-full max-w-[540px] mx-auto lg:mx-0 order-1"
            >
              <h1 className="font-playfair text-4xl md:text-5xl lg:text-[3.5rem] text-ansar-charcoal mb-4 leading-[1.1] tracking-tight">
                A convert care model
                <br />
                that actually works.
              </h1>

              <p className="font-body text-base md:text-lg text-ansar-gray leading-relaxed mb-10 max-w-[460px]">
                Ready-built systems for communities to support new Muslims.
              </p>

              <Link
                href="#choose-your-path"
                className="inline-flex items-center gap-2 bg-ansar-charcoal text-white px-6 py-3 rounded-lg text-sm font-medium tracking-wide hover:bg-black transition-colors"
              >
                Choose your path
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* RIGHT: Branded video placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="flex flex-col items-center justify-center order-2"
            >
              <div className="w-full max-w-[520px]">
                <div className="relative rounded-2xl border border-[rgba(61,61,61,0.10)] bg-white/70 backdrop-blur-sm shadow-soft overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-ansar-sage-200/30 blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-10 w-44 h-44 rounded-full bg-ansar-ochre-200/25 blur-2xl pointer-events-none" />

                  <div className="relative aspect-video bg-gradient-to-br from-ansar-sage-50 to-ansar-cream">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src="https://www.youtube.com/embed/6LkTJH1MaD0?si=WpXXvT0m-yN9-2fA"
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    ></iframe>
                  </div>

                  <div className="px-4 py-3 border-t border-[rgba(61,61,61,0.08)] bg-white/80">
                    <p className="font-body text-xs tracking-wide uppercase text-ansar-gray">Ansar Family • Platform Walkthrough</p>
                  </div>
                </div>
              </div>
              <a
                href="#choose-your-path"
                className="lg:hidden mt-3 inline-flex items-center gap-1 text-xs text-ansar-gray/80 hover:text-ansar-charcoal transition-colors"
              >
                Continue to paths
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================
          CHOOSE YOUR PATH
          ======================================== */}
      <section id="choose-your-path" className="relative z-20 bg-ansar-cream-warm py-16 md:py-20 border-y border-[rgba(61,61,61,0.08)] scroll-mt-24">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-10"
          >
            <h2 className="font-heading text-3xl md:text-4xl text-ansar-charcoal mb-3">Choose Your Path</h2>
            <p className="font-body text-base md:text-lg text-ansar-gray">
              Select the door that matches your journey today.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {PATH_CARDS.map((card, index) => {
              return (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white rounded-2xl border border-[rgba(61,61,61,0.08)] shadow-sm p-6 md:p-7 flex flex-col"
                >
                  <div className="mb-5">
                    <FlowerClusterIcon blooms={card.blooms} layout={card.bloomLayout} />
                  </div>

                  <h3 className="font-heading text-2xl text-ansar-charcoal leading-tight mb-2">{card.title}</h3>
                  <p className="font-body text-sm text-ansar-sage-700 mb-5">{card.subtitle}</p>

                  <ul className="space-y-3 mb-7 flex-1">
                    {card.description.map((line) => (
                      <li key={line} className="font-body text-sm text-ansar-gray leading-relaxed">
                        {line}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={card.href}
                    className="w-full inline-flex items-center justify-center gap-2 bg-ansar-charcoal text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-black transition-colors"
                  >
                    {card.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================
          OUR STORY + CASE STUDY
          ======================================== */}
      <div id="story" className="relative z-20 bg-ansar-cream py-16 md:py-20 overflow-hidden">
        <section className="relative px-6 mx-auto w-full max-w-[900px] min-h-[52vh] flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <div>
              <h2 className="font-heading text-4xl md:text-5xl text-ansar-charcoal mb-8">Our Story</h2>
              <div className="space-y-6 font-body text-lg md:text-xl text-ansar-gray leading-relaxed">
                <p>
                  Ansar Family started with two people who realized they couldn&apos;t do this work alone. There were too
                  many people to help and not enough structure to catch them.
                </p>
                <p>
                  We tried countless models until we found the one that actually works: The Prophetic Model. This means
                  connecting people to healthy, local communities grounded in authentic Islamic scholarship.
                </p>
                <p>
                  For five years, we have iterated, adjusted, and refined our approach based on direct feedback from New
                  Muslims and local leaders. Alhamdulillah, we have been operating for five years strong, and we are now
                  bringing this proven model to communities everywhere.
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      {/* ========================================
          THE STAKES
          ======================================== */}
      <section className="relative z-20 bg-ansar-cream pb-16 md:pb-20">
        <div className="px-6 mx-auto w-full max-w-[900px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="font-heading text-4xl md:text-5xl text-ansar-charcoal mb-8">The Stakes</h2>
            <div className="space-y-7 font-body text-lg md:text-xl text-ansar-gray leading-relaxed">
              <div>
                <p className="font-medium text-ansar-charcoal mb-2">The Problem:</p>
                <p>
                  There is a silent crisis in our communities. Many people find the truth of Islam but lose their way
                  because they are left to walk alone. Without a consistent support system, it is far too easy for a new
                  beginning to lead to isolation—and for that isolation to lead people away from the faith entirely.
                </p>
              </div>
              <div>
                <p className="font-medium text-ansar-charcoal mb-2">The Safety Net:</p>
                <p>
                  We build the infrastructure for care. Ansar Family is a system of accountability designed to ensure no one
                  is forgotten. We provide local communities with the tools to track, support, and retain their members. We
                  handle the system so that your community can focus on the one thing that matters: protecting and nurturing
                  the faith of every soul.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================
          GARDEN ANIMATION
          ======================================== */}
      <GardenAnimation />

      {/* ========================================
          FOOTER
          ======================================== */}
      <footer className="relative z-30"> {/* Removed overflow-hidden, increased z-index so text sits above flower */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/accents/footer-landscape.svg"
            alt=""
            fill
            className="object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-ansar-cream/20" />
          <div className="absolute inset-x-0 top-0 h-24 md:h-32 bg-gradient-to-b from-ansar-cream via-ansar-cream/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1000px] mx-auto px-6 py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="font-body text-ansar-charcoal/85 text-sm max-w-sm font-medium">
                Vision: Establishing and maintaining Muslim Communities globally.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
              <Link href="/join" className="font-body text-sm text-ansar-charcoal/80 hover:text-ansar-charcoal transition-colors">I&apos;m New to Islam</Link>
              <span className="text-ansar-charcoal/35">|</span>
              <Link href="/volunteer" className="font-body text-sm text-ansar-charcoal/80 hover:text-ansar-charcoal transition-colors">Become an Ansar</Link>
              <span className="text-ansar-charcoal/35">|</span>
              <Link href="/contact" className="font-body text-sm text-ansar-charcoal/80 hover:text-ansar-charcoal transition-colors">Contact Us</Link>
              <span className="text-ansar-charcoal/35">|</span>
              <Link href="/privacy" className="font-body text-sm text-ansar-charcoal/80 hover:text-ansar-charcoal transition-colors">Privacy Policy</Link>
            </div>
          </div>
          <div className="text-center mt-8">
            <span className="font-body text-sm text-ansar-charcoal/60">est. 2020 Ansar Family</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
