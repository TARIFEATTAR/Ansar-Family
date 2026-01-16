"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

/**
 * GARDEN ANIMATION - The Visual Journey
 * 
 * A scroll-based SVG garden that grows as the user explores the page.
 * The flower grows from a seed to a full bloom, representing the
 * seeker's journey from curiosity to being planted in community.
 * 
 * Positioned fixed on the right side of the viewport.
 * At the footer, the flower "plants" into the sage-green soil.
 */

interface GardenAnimationProps {
  className?: string;
}

export function GardenAnimation({ className = "" }: GardenAnimationProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPlanted, setIsPlanted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollTop / docHeight, 1);
      setScrollProgress(progress);
      setIsPlanted(progress > 0.95);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Stage thresholds for progressive reveal
  const stages = {
    stage1: scrollProgress >= 0.02,  // Main stem, first leaves
    stage2: scrollProgress >= 0.12,  // Ground grass, branches 1-2
    stage3: scrollProgress >= 0.30,  // More branches, buds
    stage4: scrollProgress >= 0.50,  // First flowers
    stage5: scrollProgress >= 0.70,  // More flowers
    stage6: scrollProgress >= 0.85,  // Crown flowers, butterfly
    stage7: scrollProgress >= 0.95,  // Final flourish, planted
  };

  return (
    <div
      ref={containerRef}
      className={`fixed right-0 top-0 h-screen w-[200px] pointer-events-none z-30 hidden xl:block opacity-80 ${className}`}
      style={{
        transform: isPlanted ? "translateY(20px)" : "translateY(0)",
        transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Garden SVG Container */}
      <div className="absolute bottom-20 right-8 w-[220px] h-[400px]">
        <svg
          viewBox="0 0 320 450"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Definitions for gradients and filters */}
          <defs>
            {/* Stem gradient */}
            <linearGradient id="stemGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#5A6A4E" />
              <stop offset="100%" stopColor="#7D8B6A" />
            </linearGradient>
            
            {/* Leaf gradient */}
            <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8FA07A" />
              <stop offset="100%" stopColor="#6B7D5C" />
            </linearGradient>
            
            {/* Terracotta flower gradient */}
            <radialGradient id="terracottaGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D4A89A" />
              <stop offset="100%" stopColor="#C4887A" />
            </radialGradient>
            
            {/* Ochre flower gradient */}
            <radialGradient id="ochreGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D4C49A" />
              <stop offset="100%" stopColor="#BCA87A" />
            </radialGradient>

            {/* Soft glow filter */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ground/Soil line - always visible */}
          <line
            x1="60"
            y1="420"
            x2="260"
            y2="420"
            stroke="#8FA07A"
            strokeWidth="3"
            strokeLinecap="round"
            opacity={isPlanted ? 1 : 0.3}
            style={{ transition: "opacity 0.5s ease" }}
          />

          {/* === STAGE 1: Main Stem === */}
          <motion.path
            d="M160 420 Q160 380 158 340 Q156 300 160 260 Q164 220 160 180"
            fill="none"
            stroke="url(#stemGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: stages.stage1 ? 1 : 0,
              opacity: stages.stage1 ? 1 : 0,
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          {/* First pair of leaves */}
          <motion.ellipse
            cx="148"
            cy="360"
            rx="18"
            ry="8"
            fill="url(#leafGradient)"
            transform="rotate(-30 148 360)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: stages.stage1 ? 1 : 0,
              opacity: stages.stage1 ? 1 : 0,
            }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          />
          <motion.ellipse
            cx="172"
            cy="355"
            rx="16"
            ry="7"
            fill="url(#leafGradient)"
            transform="rotate(25 172 355)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: stages.stage1 ? 1 : 0,
              opacity: stages.stage1 ? 1 : 0,
            }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          />

          {/* === STAGE 2: Ground grass and more leaves === */}
          {/* Ground grass */}
          <motion.g
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{
              scaleY: stages.stage2 ? 1 : 0,
              opacity: stages.stage2 ? 1 : 0,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ transformOrigin: "center bottom" }}
          >
            <path d="M90 420 Q92 400 88 385" fill="none" stroke="#A8B89A" strokeWidth="2" />
            <path d="M100 420 Q98 395 102 375" fill="none" stroke="#8FA07A" strokeWidth="2" />
            <path d="M220 420 Q222 398 218 380" fill="none" stroke="#A8B89A" strokeWidth="2" />
            <path d="M230 420 Q228 402 232 388" fill="none" stroke="#8FA07A" strokeWidth="2" />
          </motion.g>

          {/* Branch 1 - left */}
          <motion.path
            d="M158 320 Q140 310 120 315"
            fill="none"
            stroke="url(#stemGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: stages.stage2 ? 1 : 0,
              opacity: stages.stage2 ? 1 : 0,
            }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          />

          {/* Branch 2 - right */}
          <motion.path
            d="M162 300 Q180 290 200 295"
            fill="none"
            stroke="url(#stemGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: stages.stage2 ? 1 : 0,
              opacity: stages.stage2 ? 1 : 0,
            }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          />

          {/* More leaves on branches */}
          <motion.ellipse
            cx="125"
            cy="308"
            rx="14"
            ry="6"
            fill="url(#leafGradient)"
            transform="rotate(-15 125 308)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: stages.stage2 ? 1 : 0,
              opacity: stages.stage2 ? 1 : 0,
            }}
            transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
          />
          <motion.ellipse
            cx="195"
            cy="288"
            rx="14"
            ry="6"
            fill="url(#leafGradient)"
            transform="rotate(20 195 288)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: stages.stage2 ? 1 : 0,
              opacity: stages.stage2 ? 1 : 0,
            }}
            transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
          />

          {/* === STAGE 3: More branches and buds === */}
          <motion.path
            d="M156 260 Q135 250 115 258"
            fill="none"
            stroke="url(#stemGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: stages.stage3 ? 1 : 0,
              opacity: stages.stage3 ? 1 : 0,
            }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
          <motion.path
            d="M164 240 Q185 230 205 238"
            fill="none"
            stroke="url(#stemGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: stages.stage3 ? 1 : 0,
              opacity: stages.stage3 ? 1 : 0,
            }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          />

          {/* Buds */}
          <motion.ellipse
            cx="115"
            cy="255"
            rx="5"
            ry="8"
            fill="#C4CDB9"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: stages.stage3 ? 1 : 0,
              opacity: stages.stage3 ? 1 : 0,
            }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          />
          <motion.ellipse
            cx="205"
            cy="235"
            rx="5"
            ry="8"
            fill="#C4CDB9"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: stages.stage3 ? 1 : 0,
              opacity: stages.stage3 ? 1 : 0,
            }}
            transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
          />

          {/* Decorative dots */}
          <motion.circle
            cx="230"
            cy="340"
            r="3"
            fill="#D4DBC9"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: stages.stage3 ? 1 : 0,
              opacity: stages.stage3 ? 0.6 : 0,
            }}
            transition={{ duration: 0.4, delay: 0.8, ease: "easeOut" }}
          />
          <motion.circle
            cx="95"
            cy="350"
            r="2.5"
            fill="#D4DBC9"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: stages.stage3 ? 1 : 0,
              opacity: stages.stage3 ? 0.6 : 0,
            }}
            transition={{ duration: 0.4, delay: 1, ease: "easeOut" }}
          />

          {/* === STAGE 4: First flowers === */}
          {/* Terracotta flower - right branch */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: stages.stage4 ? 1 : 0,
              opacity: stages.stage4 ? 1 : 0,
            }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            filter="url(#softGlow)"
          >
            <ellipse cx="205" cy="295" rx="10" ry="16" fill="#D4A89A" transform="rotate(-15 205 295)" />
            <ellipse cx="212" cy="289" rx="10" ry="16" fill="#C9968A" transform="rotate(25 212 289)" />
            <ellipse cx="200" cy="285" rx="10" ry="16" fill="#D4A89A" transform="rotate(-55 200 285)" />
            <ellipse cx="218" cy="299" rx="10" ry="16" fill="#C9968A" transform="rotate(65 218 299)" />
            <circle cx="208" cy="293" r="6" fill="#8B5A4E" />
          </motion.g>

          {/* Ochre flower - left branch */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: stages.stage4 ? 1 : 0,
              opacity: stages.stage4 ? 1 : 0,
            }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            filter="url(#softGlow)"
          >
            <ellipse cx="118" cy="310" rx="9" ry="14" fill="#D4C49A" transform="rotate(20 118 310)" />
            <ellipse cx="111" cy="304" rx="9" ry="14" fill="#C9B896" transform="rotate(-20 111 304)" />
            <ellipse cx="123" cy="302" rx="9" ry="14" fill="#D4C49A" transform="rotate(60 123 302)" />
            <ellipse cx="108" cy="312" rx="9" ry="14" fill="#C9B896" transform="rotate(-60 108 312)" />
            <circle cx="115" cy="308" r="5" fill="#736548" />
          </motion.g>

          {/* === STAGE 5: More flowers bloom === */}
          {/* Terracotta flower - upper right */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: stages.stage5 ? 1 : 0,
              opacity: stages.stage5 ? 1 : 0,
            }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            filter="url(#softGlow)"
          >
            <ellipse cx="210" cy="238" rx="8" ry="13" fill="#C9968A" transform="rotate(-10 210 238)" />
            <ellipse cx="217" cy="232" rx="8" ry="13" fill="#D4A89A" transform="rotate(30 217 232)" />
            <ellipse cx="205" cy="228" rx="8" ry="13" fill="#C9968A" transform="rotate(-50 205 228)" />
            <ellipse cx="220" cy="242" rx="8" ry="13" fill="#D4A89A" transform="rotate(70 220 242)" />
            <circle cx="212" cy="236" r="5" fill="#8B5A4E" />
          </motion.g>

          {/* Ochre flower - upper left */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: stages.stage5 ? 1 : 0,
              opacity: stages.stage5 ? 1 : 0,
            }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            filter="url(#softGlow)"
          >
            <ellipse cx="112" cy="255" rx="7" ry="11" fill="#C9B896" transform="rotate(15 112 255)" />
            <ellipse cx="106" cy="250" rx="7" ry="11" fill="#D4C49A" transform="rotate(-25 106 250)" />
            <ellipse cx="116" cy="248" rx="7" ry="11" fill="#C9B896" transform="rotate(55 116 248)" />
            <ellipse cx="104" cy="258" rx="7" ry="11" fill="#D4C49A" transform="rotate(-65 104 258)" />
            <circle cx="110" cy="253" r="4" fill="#736548" />
          </motion.g>

          {/* More decorative dots */}
          <motion.circle
            cx="240"
            cy="260"
            r="2"
            fill="#E8D9B5"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: stages.stage5 ? 1 : 0,
              opacity: stages.stage5 ? 0.7 : 0,
            }}
            transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
          />
          <motion.circle
            cx="85"
            cy="275"
            r="2.5"
            fill="#EBDAD4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: stages.stage5 ? 1 : 0,
              opacity: stages.stage5 ? 0.7 : 0,
            }}
            transition={{ duration: 0.4, delay: 0.7, ease: "easeOut" }}
          />

          {/* === STAGE 6: Crown flowers and first butterfly === */}
          {/* Top stem extension */}
          <motion.path
            d="M160 180 Q158 150 162 120"
            fill="none"
            stroke="url(#stemGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: stages.stage6 ? 1 : 0,
              opacity: stages.stage6 ? 1 : 0,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Crown flower - terracotta */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: stages.stage6 ? 1 : 0,
              opacity: stages.stage6 ? 1 : 0,
            }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            filter="url(#softGlow)"
          >
            <ellipse cx="162" cy="115" rx="12" ry="18" fill="#D4A89A" transform="rotate(-8 162 115)" />
            <ellipse cx="170" cy="108" rx="12" ry="18" fill="#C9968A" transform="rotate(32 170 108)" />
            <ellipse cx="155" cy="105" rx="12" ry="18" fill="#D4A89A" transform="rotate(-48 155 105)" />
            <ellipse cx="174" cy="120" rx="12" ry="18" fill="#C9968A" transform="rotate(72 174 120)" />
            <ellipse cx="162" cy="128" rx="12" ry="18" fill="#D4A89A" transform="rotate(108 162 128)" />
            <circle cx="164" cy="114" r="7" fill="#8B5A4E" />
          </motion.g>

          {/* First butterfly */}
          <motion.g
            initial={{ x: -30, y: 20, opacity: 0 }}
            animate={{
              x: stages.stage6 ? 0 : -30,
              y: stages.stage6 ? 0 : 20,
              opacity: stages.stage6 ? 1 : 0,
            }}
            transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
          >
            <motion.g
              animate={{
                y: stages.stage6 ? [0, -5, 0, -3, 0] : 0,
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ellipse cx="240" cy="180" rx="10" ry="6" fill="#E8D9B5" transform="rotate(-20 240 180)" opacity="0.9" />
              <ellipse cx="250" cy="178" rx="10" ry="6" fill="#D4C49A" transform="rotate(20 250 178)" opacity="0.9" />
              <ellipse cx="245" cy="182" rx="2.5" ry="7" fill="#5A6A4E" />
            </motion.g>
          </motion.g>

          {/* === STAGE 7: Final flourish - second butterfly and falling petals === */}
          {/* Second butterfly */}
          <motion.g
            initial={{ x: 30, y: -20, opacity: 0 }}
            animate={{
              x: stages.stage7 ? 0 : 30,
              y: stages.stage7 ? 0 : -20,
              opacity: stages.stage7 ? 1 : 0,
            }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          >
            <motion.g
              animate={{
                y: stages.stage7 ? [0, -4, 0, -6, 0] : 0,
                x: stages.stage7 ? [0, 3, 0, -2, 0] : 0,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ellipse cx="85" cy="200" rx="8" ry="5" fill="#EBDAD4" transform="rotate(15 85 200)" opacity="0.85" />
              <ellipse cx="93" cy="199" rx="8" ry="5" fill="#D4A89A" transform="rotate(-15 93 199)" opacity="0.85" />
              <ellipse cx="89" cy="201" rx="2" ry="6" fill="#5A6A4E" />
            </motion.g>
          </motion.g>

          {/* Falling petals */}
          <motion.ellipse
            cx="180"
            cy="90"
            rx="5"
            ry="7"
            fill="#EBDAD4"
            transform="rotate(25 180 90)"
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: stages.stage7 ? [0, 30, 60] : 0,
              opacity: stages.stage7 ? [0.8, 0.6, 0] : 0,
              rotate: stages.stage7 ? [25, 45, 65] : 25,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeIn",
              delay: 0.5,
            }}
          />
          <motion.ellipse
            cx="145"
            cy="140"
            rx="4"
            ry="6"
            fill="#E8D9B5"
            transform="rotate(-15 145 140)"
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: stages.stage7 ? [0, 25, 50] : 0,
              opacity: stages.stage7 ? [0.7, 0.5, 0] : 0,
              rotate: stages.stage7 ? [-15, 5, 25] : -15,
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeIn",
              delay: 1,
            }}
          />

          {/* Planted state - roots appearing */}
          <motion.g
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{
              opacity: isPlanted ? 1 : 0,
              scaleY: isPlanted ? 1 : 0,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ transformOrigin: "160px 420px" }}
          >
            <path d="M160 420 Q155 435 145 445" fill="none" stroke="#5A6A4E" strokeWidth="2" opacity="0.6" />
            <path d="M160 420 Q165 438 175 448" fill="none" stroke="#5A6A4E" strokeWidth="2" opacity="0.6" />
            <path d="M160 420 Q160 440 160 455" fill="none" stroke="#5A6A4E" strokeWidth="2.5" opacity="0.7" />
          </motion.g>
        </svg>
      </div>

    </div>
  );
}

export default GardenAnimation;
