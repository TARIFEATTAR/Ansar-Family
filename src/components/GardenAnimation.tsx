"use client";

import { useEffect, useState, useRef } from "react";

/**
 * GARDEN ANIMATION - Scroll-Driven Growth
 * 
 * A beautiful SVG garden that grows as the user scrolls.
 * The stem is ALWAYS anchored to the viewport bottom.
 * As user scrolls, the garden grows upward from the soil.
 * 
 * Uses CSS classes for smooth transitions and a ref to track
 * animated elements (avoiding re-renders).
 */

interface GardenAnimationProps {
  className?: string;
}

// Garden growth stages - each stage reveals more elements
const GARDEN_STAGES = {
  stage1: { scroll: 0.02, elements: ['mainStem', 'grass1', 'grass2', 'leaf1', 'leaf2'], height: 100 },
  stage2: { scroll: 0.12, elements: ['grass3', 'grass4', 'branch1', 'branch2', 'leaf3', 'leaf4', 'leaf5', 'leaf6'], height: 180 },
  stage3: { scroll: 0.28, elements: ['branch3', 'branch4', 'leaf7', 'leaf8', 'leaf9', 'leaf10', 'bud1', 'dot1', 'dot2'], height: 260 },
  stage4: { scroll: 0.42, elements: ['branch5', 'branch6', 'leaf11', 'leaf12', 'leaf13', 'leaf14', 'flower1', 'flower2', 'bud2', 'dot3', 'dot4'], height: 340 },
  stage5: { scroll: 0.58, elements: ['branch7', 'branch8', 'leaf15', 'leaf16', 'flower3', 'flower4', 'bud3', 'dot5', 'dot6'], height: 400 },
  stage6: { scroll: 0.72, elements: ['flower5', 'flower6', 'butterfly1'], height: 450 },
  stage7: { scroll: 0.88, elements: ['flower7', 'flower8', 'flower9', 'dot7'], height: 500 },
};

export function GardenAnimation({ className = "" }: GardenAnimationProps) {
  const [gardenHeight, setGardenHeight] = useState(80);
  // Use ref instead of state to avoid re-renders
  const animatedElementsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const updateGarden = (scrollProgress: number) => {
      // Calculate height: 80px at start, 500px at end
      const minHeight = 80;
      const maxHeight = 500;
      const newHeight = minHeight + (scrollProgress * (maxHeight - minHeight));
      setGardenHeight(newHeight);

      // Trigger animations for each stage
      Object.values(GARDEN_STAGES).forEach((stage) => {
        if (scrollProgress >= stage.scroll) {
          stage.elements.forEach(id => {
            if (!animatedElementsRef.current.has(id)) {
              animatedElementsRef.current.add(id);
              // Apply CSS class to element
              const el = document.getElementById(id);
              if (el) {
                if (el.classList.contains('garden-stem')) {
                  el.classList.add('grow');
                } else if (el.classList.contains('garden-leaf')) {
                  el.classList.add('bloom');
                } else if (el.classList.contains('garden-flower')) {
                  el.classList.add('bloom');
                } else if (el.classList.contains('garden-bud')) {
                  el.classList.add('bloom');
                } else if (el.classList.contains('garden-grass')) {
                  el.classList.add('grow');
                } else if (el.classList.contains('garden-dot')) {
                  el.classList.add('visible');
                } else if (el.classList.contains('garden-butterfly')) {
                  el.classList.add('visible');
                }
              }
            }
          });
        }
      });
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      updateGarden(scrollProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 right-5 md:right-10 pointer-events-none z-50 hidden md:block ${className}`}
      style={{ 
        width: 'clamp(140px, 15vw, 220px)',
        height: `${gardenHeight}px`,
        transition: 'height 0.3s ease-out'
      }}
      aria-hidden="true"
    >
      <svg 
        className="w-full h-full overflow-visible" 
        viewBox="0 0 220 500" 
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <linearGradient id="stemGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="var(--sage-700, #5A6A4E)" />
            <stop offset="100%" stopColor="var(--sage-500, #8FA07A)" />
          </linearGradient>
        </defs>

        {/* Ground grass (Stage 1) */}
        <path id="grass1" className="garden-grass" d="M20 500 Q22 490 20 480 Q18 490 20 500"/>
        <path id="grass2" className="garden-grass" d="M35 500 Q38 492 35 484 Q32 492 35 500"/>
        <path id="grass3" className="garden-grass" d="M180 500 Q182 492 180 484 Q178 492 180 500"/>
        <path id="grass4" className="garden-grass" d="M195 500 Q198 494 195 488 Q192 494 195 500"/>

        {/* Main stem - grows from bottom */}
        <path id="mainStem" className="garden-stem" d="M110 500 Q108 460 112 410 Q108 360 115 300 Q110 240 118 180 Q113 120 120 70"/>

        {/* Branch 1 - Lower left (Stage 2) */}
        <path id="branch1" className="garden-stem garden-stem-thin" d="M112 410 Q90 395 65 385"/>
        {/* Branch 2 - Lower right (Stage 2) */}
        <path id="branch2" className="garden-stem garden-stem-thin" d="M112 400 Q135 385 160 380"/>

        {/* Branch 3 - Mid left (Stage 3) */}
        <path id="branch3" className="garden-stem garden-stem-thin" d="M110 330 Q85 315 55 305"/>
        {/* Branch 4 - Mid right (Stage 3) */}
        <path id="branch4" className="garden-stem garden-stem-thin" d="M115 320 Q140 305 170 300"/>

        {/* Branch 5 - Upper left (Stage 4) */}
        <path id="branch5" className="garden-stem garden-stem-thin" d="M113 240 Q88 225 58 218"/>
        {/* Branch 6 - Upper right (Stage 4) */}
        <path id="branch6" className="garden-stem garden-stem-thin" d="M118 230 Q145 215 175 210"/>

        {/* Branch 7 - Top left (Stage 5) */}
        <path id="branch7" className="garden-stem garden-stem-thin" d="M116 150 Q95 138 70 132"/>
        {/* Branch 8 - Top right (Stage 5) */}
        <path id="branch8" className="garden-stem garden-stem-thin" d="M120 140 Q145 128 168 122"/>

        {/* Leaves - Stage 1 (base) */}
        <ellipse id="leaf1" className="garden-leaf" cx="125" cy="460" rx="14" ry="6" transform="rotate(-35 125 460)"/>
        <ellipse id="leaf2" className="garden-leaf garden-leaf-light" cx="95" cy="465" rx="13" ry="5" transform="rotate(30 95 465)"/>

        {/* Leaves - Stage 2 */}
        <ellipse id="leaf3" className="garden-leaf" cx="75" cy="390" rx="14" ry="6" transform="rotate(25 75 390)"/>
        <ellipse id="leaf4" className="garden-leaf garden-leaf-dark" cx="150" cy="385" rx="13" ry="6" transform="rotate(-30 150 385)"/>
        <ellipse id="leaf5" className="garden-leaf garden-leaf-light" cx="60" cy="378" rx="10" ry="4" transform="rotate(40 60 378)"/>
        <ellipse id="leaf6" className="garden-leaf" cx="165" cy="375" rx="11" ry="5" transform="rotate(-35 165 375)"/>

        {/* Leaves - Stage 3 */}
        <ellipse id="leaf7" className="garden-leaf" cx="65" cy="310" rx="13" ry="6" transform="rotate(30 65 310)"/>
        <ellipse id="leaf8" className="garden-leaf garden-leaf-dark" cx="160" cy="305" rx="14" ry="6" transform="rotate(-25 160 305)"/>
        <ellipse id="leaf9" className="garden-leaf garden-leaf-light" cx="50" cy="298" rx="10" ry="4" transform="rotate(45 50 298)"/>
        <ellipse id="leaf10" className="garden-leaf" cx="175" cy="295" rx="11" ry="5" transform="rotate(-40 175 295)"/>

        {/* Leaves - Stage 4 */}
        <ellipse id="leaf11" className="garden-leaf" cx="68" cy="222" rx="12" ry="5" transform="rotate(35 68 222)"/>
        <ellipse id="leaf12" className="garden-leaf garden-leaf-dark" cx="165" cy="215" rx="13" ry="5" transform="rotate(-30 165 215)"/>
        <ellipse id="leaf13" className="garden-leaf garden-leaf-light" cx="52" cy="212" rx="9" ry="4" transform="rotate(40 52 212)"/>
        <ellipse id="leaf14" className="garden-leaf" cx="180" cy="205" rx="10" ry="4" transform="rotate(-35 180 205)"/>

        {/* Leaves - Stage 5 */}
        <ellipse id="leaf15" className="garden-leaf" cx="78" cy="138" rx="11" ry="4" transform="rotate(30 78 138)"/>
        <ellipse id="leaf16" className="garden-leaf garden-leaf-dark" cx="160" cy="128" rx="12" ry="4" transform="rotate(-25 160 128)"/>

        {/* Buds */}
        <ellipse id="bud1" className="garden-bud" cx="55" cy="300" rx="4" ry="7"/>
        <ellipse id="bud2" className="garden-bud" cx="175" cy="210" rx="3" ry="6"/>
        <ellipse id="bud3" className="garden-bud" cx="70" cy="130" rx="3" ry="5"/>

        {/* Flower 1 - Terracotta (Lower right branch) Stage 4 */}
        <g id="flower1" className="garden-flower">
          <ellipse className="petal-terracotta" cx="160" cy="375" rx="10" ry="16" transform="rotate(-15 160 375)"/>
          <ellipse className="petal-terracotta-light" cx="167" cy="369" rx="10" ry="16" transform="rotate(25 167 369)"/>
          <ellipse className="petal-terracotta" cx="155" cy="365" rx="10" ry="16" transform="rotate(-55 155 365)"/>
          <ellipse className="petal-terracotta-light" cx="173" cy="379" rx="10" ry="16" transform="rotate(65 173 379)"/>
          <ellipse className="petal-terracotta" cx="163" cy="385" rx="10" ry="16" transform="rotate(100 163 385)"/>
          <circle className="flower-center" cx="163" cy="373" r="6"/>
        </g>

        {/* Flower 2 - Ochre (Lower left branch) Stage 4 */}
        <g id="flower2" className="garden-flower">
          <ellipse className="petal-ochre" cx="65" cy="385" rx="9" ry="14" transform="rotate(20 65 385)"/>
          <ellipse className="petal-ochre-dark" cx="58" cy="379" rx="9" ry="14" transform="rotate(-20 58 379)"/>
          <ellipse className="petal-ochre" cx="70" cy="377" rx="9" ry="14" transform="rotate(60 70 377)"/>
          <ellipse className="petal-ochre-dark" cx="55" cy="387" rx="9" ry="14" transform="rotate(-60 55 387)"/>
          <ellipse className="petal-ochre" cx="62" cy="393" rx="9" ry="14" transform="rotate(-100 62 393)"/>
          <circle className="flower-center-dark" cx="62" cy="383" r="5"/>
        </g>

        {/* Flower 3 - Terracotta (Mid right) Stage 5 */}
        <g id="flower3" className="garden-flower">
          <ellipse className="petal-terracotta-light" cx="170" cy="295" rx="8" ry="13" transform="rotate(-10 170 295)"/>
          <ellipse className="petal-terracotta" cx="176" cy="290" rx="8" ry="13" transform="rotate(30 176 290)"/>
          <ellipse className="petal-terracotta-light" cx="165" cy="287" rx="8" ry="13" transform="rotate(-50 165 287)"/>
          <ellipse className="petal-terracotta" cx="179" cy="300" rx="8" ry="13" transform="rotate(70 179 300)"/>
          <circle className="flower-center" cx="171" cy="294" r="5"/>
        </g>

        {/* Flower 4 - Ochre (Mid left) Stage 5 */}
        <g id="flower4" className="garden-flower">
          <ellipse className="petal-ochre-dark" cx="55" cy="305" rx="8" ry="12" transform="rotate(15 55 305)"/>
          <ellipse className="petal-ochre" cx="49" cy="300" rx="8" ry="12" transform="rotate(-25 49 300)"/>
          <ellipse className="petal-ochre-dark" cx="59" cy="298" rx="8" ry="12" transform="rotate(55 59 298)"/>
          <ellipse className="petal-ochre" cx="47" cy="308" rx="8" ry="12" transform="rotate(-65 47 308)"/>
          <circle className="flower-center" cx="53" cy="303" r="4"/>
        </g>

        {/* Flower 5 - Terracotta (Upper right) Stage 6 */}
        <g id="flower5" className="garden-flower">
          <ellipse className="petal-terracotta" cx="175" cy="205" rx="9" ry="14" transform="rotate(-5 175 205)"/>
          <ellipse className="petal-terracotta-light" cx="182" cy="199" rx="9" ry="14" transform="rotate(35 182 199)"/>
          <ellipse className="petal-terracotta" cx="169" cy="196" rx="9" ry="14" transform="rotate(-45 169 196)"/>
          <ellipse className="petal-terracotta-light" cx="185" cy="210" rx="9" ry="14" transform="rotate(75 185 210)"/>
          <ellipse className="petal-terracotta" cx="177" cy="215" rx="9" ry="14" transform="rotate(105 177 215)"/>
          <circle className="flower-center-dark" cx="177" cy="204" r="5"/>
        </g>

        {/* Flower 6 - Ochre (Upper left) Stage 6 */}
        <g id="flower6" className="garden-flower">
          <ellipse className="petal-ochre" cx="58" cy="218" rx="8" ry="12" transform="rotate(10 58 218)"/>
          <ellipse className="petal-ochre-dark" cx="52" cy="213" rx="8" ry="12" transform="rotate(-30 52 213)"/>
          <ellipse className="petal-ochre" cx="62" cy="211" rx="8" ry="12" transform="rotate(50 62 211)"/>
          <ellipse className="petal-ochre-dark" cx="50" cy="221" rx="8" ry="12" transform="rotate(-70 50 221)"/>
          <circle className="flower-center" cx="56" cy="216" r="4"/>
        </g>

        {/* Crown Flower 7 - Terracotta (Top right) Stage 7 */}
        <g id="flower7" className="garden-flower">
          <ellipse className="petal-terracotta-light" cx="168" cy="118" rx="10" ry="15" transform="rotate(-8 168 118)"/>
          <ellipse className="petal-terracotta" cx="176" cy="111" rx="10" ry="15" transform="rotate(32 176 111)"/>
          <ellipse className="petal-terracotta-light" cx="161" cy="108" rx="10" ry="15" transform="rotate(-48 161 108)"/>
          <ellipse className="petal-terracotta" cx="180" cy="123" rx="10" ry="15" transform="rotate(72 180 123)"/>
          <ellipse className="petal-terracotta-light" cx="168" cy="131" rx="10" ry="15" transform="rotate(108 168 131)"/>
          <circle className="flower-center" cx="170" cy="117" r="6"/>
        </g>

        {/* Crown Flower 8 - Ochre (Top left) Stage 7 */}
        <g id="flower8" className="garden-flower">
          <ellipse className="petal-ochre-dark" cx="70" cy="128" rx="8" ry="12" transform="rotate(12 70 128)"/>
          <ellipse className="petal-ochre" cx="64" cy="122" rx="8" ry="12" transform="rotate(-28 64 122)"/>
          <ellipse className="petal-ochre-dark" cx="74" cy="120" rx="8" ry="12" transform="rotate(52 74 120)"/>
          <ellipse className="petal-ochre" cx="62" cy="131" rx="8" ry="12" transform="rotate(-68 62 131)"/>
          <circle className="flower-center-dark" cx="68" cy="125" r="4"/>
        </g>

        {/* Top Crown - Main Flower (Stage 7) */}
        <g id="flower9" className="garden-flower">
          <ellipse className="petal-terracotta" cx="120" cy="60" rx="12" ry="18" transform="rotate(0 120 60)"/>
          <ellipse className="petal-terracotta-light" cx="130" cy="52" rx="12" ry="18" transform="rotate(40 130 52)"/>
          <ellipse className="petal-terracotta" cx="110" cy="50" rx="12" ry="18" transform="rotate(-40 110 50)"/>
          <ellipse className="petal-terracotta-light" cx="135" cy="68" rx="12" ry="18" transform="rotate(80 135 68)"/>
          <ellipse className="petal-terracotta" cx="105" cy="70" rx="12" ry="18" transform="rotate(-80 105 70)"/>
          <circle className="flower-center-dark" cx="120" cy="62" r="7"/>
        </g>

        {/* Decorative dots */}
        <circle id="dot1" className="garden-dot" cx="185" cy="400" r="2"/>
        <circle id="dot2" className="garden-dot" cx="40" cy="395" r="2"/>
        <circle id="dot3" className="garden-dot" cx="190" cy="320" r="1.5"/>
        <circle id="dot4" className="garden-dot" cx="35" cy="315" r="1.5"/>
        <circle id="dot5" className="garden-dot" cx="195" cy="235" r="2"/>
        <circle id="dot6" className="garden-dot" cx="30" cy="230" r="2"/>
        <circle id="dot7" className="garden-dot" cx="120" cy="40" r="2"/>

        {/* Butterfly */}
        <g id="butterfly1" className="garden-butterfly">
          <ellipse className="butterfly-wing" cx="195" cy="160" rx="8" ry="5" transform="rotate(-20 195 160)"/>
          <ellipse className="butterfly-wing" cx="203" cy="158" rx="8" ry="5" transform="rotate(20 203 158)"/>
          <ellipse className="butterfly-body" cx="199" cy="162" rx="2" ry="6"/>
        </g>
      </svg>
    </div>
  );
}

export default GardenAnimation;
