"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * GARDEN ANIMATION
 * A scroll-based SVG flower that grows as users explore the page
 * 
 * 7 Stages of growth tied to scroll progress:
 * 1. Main stem + first leaves
 * 2. Ground grass + branches
 * 3. More branches + buds + dots
 * 4. First flowers bloom
 * 5. More flowers bloom
 * 6. Crown flower + first butterfly
 * 7. Second butterfly + falling petals + roots (planted!)
 */

export default function GardenAnimation() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();

  // Transform scroll progress to growth stages
  const stemHeight = useTransform(scrollYProgress, [0, 0.3], [0, 400]);
  const leafOpacity1 = useTransform(scrollYProgress, [0.02, 0.08], [0, 1]);
  const leafOpacity2 = useTransform(scrollYProgress, [0.05, 0.12], [0, 1]);
  const grassOpacity = useTransform(scrollYProgress, [0.12, 0.2], [0, 1]);
  const branch1Opacity = useTransform(scrollYProgress, [0.15, 0.25], [0, 1]);
  const branch2Opacity = useTransform(scrollYProgress, [0.2, 0.3], [0, 1]);
  const budsOpacity = useTransform(scrollYProgress, [0.3, 0.4], [0, 1]);
  const dotsOpacity = useTransform(scrollYProgress, [0.35, 0.45], [0, 1]);
  const flower1Opacity = useTransform(scrollYProgress, [0.5, 0.6], [0, 1]);
  const flower2Opacity = useTransform(scrollYProgress, [0.55, 0.65], [0, 1]);
  const flower3Opacity = useTransform(scrollYProgress, [0.7, 0.8], [0, 1]);
  const crownOpacity = useTransform(scrollYProgress, [0.85, 0.92], [0, 1]);
  const butterfly1Opacity = useTransform(scrollYProgress, [0.88, 0.95], [0, 1]);
  const butterfly2Opacity = useTransform(scrollYProgress, [0.95, 1], [0, 1]);
  const rootsOpacity = useTransform(scrollYProgress, [0.95, 1], [0, 1]);
  const petalsOpacity = useTransform(scrollYProgress, [0.92, 1], [0, 1]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-[280px] pointer-events-none z-40 hidden lg:flex items-end justify-center pb-0">
      <svg
        viewBox="0 0 280 800"
        className="w-full h-full"
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="stemGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#5A6A4E" />
            <stop offset="100%" stopColor="#7D8B6A" />
          </linearGradient>
          <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8FA07A" />
            <stop offset="100%" stopColor="#6B7D5C" />
          </linearGradient>
          <linearGradient id="flowerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C4887A" />
            <stop offset="100%" stopColor="#B87D6E" />
          </linearGradient>
          <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BCA87A" />
            <stop offset="100%" stopColor="#A8956A" />
          </linearGradient>
        </defs>

        {/* Roots (appear at the end) */}
        <motion.g style={{ opacity: rootsOpacity }}>
          <path
            d="M140 780 Q130 800, 110 820"
            stroke="#5A6A4E"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M140 780 Q145 810, 160 830"
            stroke="#5A6A4E"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M140 785 Q125 815, 90 835"
            stroke="#6B7D5C"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M140 785 Q155 820, 180 840"
            stroke="#6B7D5C"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </motion.g>

        {/* Ground grass */}
        <motion.g style={{ opacity: grassOpacity }}>
          {[...Array(12)].map((_, i) => (
            <path
              key={`grass-${i}`}
              d={`M${60 + i * 15} 780 Q${65 + i * 15} ${760 - Math.random() * 20}, ${60 + i * 15 + (Math.random() - 0.5) * 10} ${745 - Math.random() * 15}`}
              stroke="#8FA07A"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity={0.6 + Math.random() * 0.4}
            />
          ))}
        </motion.g>

        {/* Main stem */}
        <motion.path
          d="M140 780 Q135 600, 140 500 Q145 400, 140 300 Q138 200, 140 100"
          stroke="url(#stemGradient)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          style={{
            pathLength: useTransform(scrollYProgress, [0, 0.8], [0, 1]),
          }}
        />

        {/* First leaves (Stage 1) */}
        <motion.g style={{ opacity: leafOpacity1 }}>
          <ellipse
            cx="120"
            cy="700"
            rx="25"
            ry="12"
            fill="url(#leafGradient)"
            transform="rotate(-30, 120, 700)"
          />
          <ellipse
            cx="160"
            cy="680"
            rx="25"
            ry="12"
            fill="url(#leafGradient)"
            transform="rotate(25, 160, 680)"
          />
        </motion.g>

        {/* Second leaves (Stage 1) */}
        <motion.g style={{ opacity: leafOpacity2 }}>
          <ellipse
            cx="115"
            cy="620"
            rx="22"
            ry="10"
            fill="url(#leafGradient)"
            transform="rotate(-35, 115, 620)"
          />
          <ellipse
            cx="165"
            cy="600"
            rx="22"
            ry="10"
            fill="url(#leafGradient)"
            transform="rotate(30, 165, 600)"
          />
        </motion.g>

        {/* Branch 1 (Stage 2) */}
        <motion.g style={{ opacity: branch1Opacity }}>
          <path
            d="M140 550 Q100 530, 80 480"
            stroke="#7D8B6A"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse
            cx="75"
            cy="475"
            rx="18"
            ry="9"
            fill="url(#leafGradient)"
            transform="rotate(-45, 75, 475)"
          />
        </motion.g>

        {/* Branch 2 (Stage 2) */}
        <motion.g style={{ opacity: branch2Opacity }}>
          <path
            d="M140 480 Q180 460, 200 420"
            stroke="#7D8B6A"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse
            cx="205"
            cy="415"
            rx="18"
            ry="9"
            fill="url(#leafGradient)"
            transform="rotate(40, 205, 415)"
          />
        </motion.g>

        {/* Buds (Stage 3) */}
        <motion.g style={{ opacity: budsOpacity }}>
          <circle cx="75" cy="460" r="6" fill="#C4887A" />
          <circle cx="205" cy="400" r="6" fill="#C4887A" />
          <circle cx="140" cy="350" r="8" fill="#BCA87A" />
        </motion.g>

        {/* Decorative dots (Stage 3) */}
        <motion.g style={{ opacity: dotsOpacity }}>
          {[...Array(8)].map((_, i) => (
            <circle
              key={`dot-${i}`}
              cx={100 + Math.random() * 80}
              cy={400 + Math.random() * 200}
              r={2 + Math.random() * 2}
              fill="#8FA07A"
              opacity={0.4 + Math.random() * 0.3}
            />
          ))}
        </motion.g>

        {/* Flower 1 (Stage 4) */}
        <motion.g style={{ opacity: flower1Opacity }}>
          <g transform="translate(75, 450)">
            {[...Array(6)].map((_, i) => (
              <ellipse
                key={`petal1-${i}`}
                cx={Math.cos((i * 60 * Math.PI) / 180) * 15}
                cy={Math.sin((i * 60 * Math.PI) / 180) * 15}
                rx="10"
                ry="6"
                fill="url(#flowerGradient)"
                transform={`rotate(${i * 60}, ${Math.cos((i * 60 * Math.PI) / 180) * 15}, ${Math.sin((i * 60 * Math.PI) / 180) * 15})`}
              />
            ))}
            <circle cx="0" cy="0" r="6" fill="#BCA87A" />
          </g>
        </motion.g>

        {/* Flower 2 (Stage 4) */}
        <motion.g style={{ opacity: flower2Opacity }}>
          <g transform="translate(205, 390)">
            {[...Array(6)].map((_, i) => (
              <ellipse
                key={`petal2-${i}`}
                cx={Math.cos((i * 60 * Math.PI) / 180) * 12}
                cy={Math.sin((i * 60 * Math.PI) / 180) * 12}
                rx="8"
                ry="5"
                fill="url(#flowerGradient)"
                transform={`rotate(${i * 60}, ${Math.cos((i * 60 * Math.PI) / 180) * 12}, ${Math.sin((i * 60 * Math.PI) / 180) * 12})`}
              />
            ))}
            <circle cx="0" cy="0" r="5" fill="#BCA87A" />
          </g>
        </motion.g>

        {/* Flower 3 (Stage 5) */}
        <motion.g style={{ opacity: flower3Opacity }}>
          <g transform="translate(110, 380)">
            {[...Array(5)].map((_, i) => (
              <ellipse
                key={`petal3-${i}`}
                cx={Math.cos((i * 72 * Math.PI) / 180) * 10}
                cy={Math.sin((i * 72 * Math.PI) / 180) * 10}
                rx="7"
                ry="4"
                fill="#C4CDB9"
                transform={`rotate(${i * 72}, ${Math.cos((i * 72 * Math.PI) / 180) * 10}, ${Math.sin((i * 72 * Math.PI) / 180) * 10})`}
              />
            ))}
            <circle cx="0" cy="0" r="4" fill="#A8956A" />
          </g>
        </motion.g>

        {/* Crown flower (Stage 6) */}
        <motion.g style={{ opacity: crownOpacity }}>
          <g transform="translate(140, 100)">
            {[...Array(8)].map((_, i) => (
              <ellipse
                key={`crown-${i}`}
                cx={Math.cos((i * 45 * Math.PI) / 180) * 25}
                cy={Math.sin((i * 45 * Math.PI) / 180) * 25}
                rx="15"
                ry="8"
                fill="url(#crownGradient)"
                transform={`rotate(${i * 45}, ${Math.cos((i * 45 * Math.PI) / 180) * 25}, ${Math.sin((i * 45 * Math.PI) / 180) * 25})`}
              />
            ))}
            <circle cx="0" cy="0" r="12" fill="#C4887A" />
            <circle cx="0" cy="0" r="6" fill="#BCA87A" />
          </g>
        </motion.g>

        {/* Butterfly 1 (Stage 6) */}
        <motion.g 
          style={{ opacity: butterfly1Opacity }}
          className="animate-float"
        >
          <g transform="translate(180, 150)">
            <ellipse cx="-10" cy="0" rx="12" ry="8" fill="#C4887A" opacity="0.8" />
            <ellipse cx="10" cy="0" rx="12" ry="8" fill="#C4887A" opacity="0.8" />
            <ellipse cx="-8" cy="-5" rx="8" ry="5" fill="#BCA87A" opacity="0.7" />
            <ellipse cx="8" cy="-5" rx="8" ry="5" fill="#BCA87A" opacity="0.7" />
            <ellipse cx="0" cy="0" rx="2" ry="6" fill="#5A6A4E" />
          </g>
        </motion.g>

        {/* Butterfly 2 (Stage 7) */}
        <motion.g 
          style={{ opacity: butterfly2Opacity }}
          className="animate-float"
        >
          <g transform="translate(90, 200)">
            <ellipse cx="-8" cy="0" rx="10" ry="6" fill="#8FA07A" opacity="0.8" />
            <ellipse cx="8" cy="0" rx="10" ry="6" fill="#8FA07A" opacity="0.8" />
            <ellipse cx="-6" cy="-4" rx="6" ry="4" fill="#C4CDB9" opacity="0.7" />
            <ellipse cx="6" cy="-4" rx="6" ry="4" fill="#C4CDB9" opacity="0.7" />
            <ellipse cx="0" cy="0" rx="1.5" ry="5" fill="#5A6A4E" />
          </g>
        </motion.g>

        {/* Falling petals (Stage 7) */}
        <motion.g style={{ opacity: petalsOpacity }}>
          {[...Array(5)].map((_, i) => (
            <motion.ellipse
              key={`falling-petal-${i}`}
              cx={100 + i * 25}
              cy={250 + i * 50}
              rx="4"
              ry="2"
              fill="#C4887A"
              opacity={0.5}
              animate={{
                y: [0, 20, 0],
                x: [0, 10, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.g>
      </svg>
    </div>
  );
}
