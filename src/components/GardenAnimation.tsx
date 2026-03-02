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
  stage1: { scroll: 0.02, elements: ['mainStem', 'rightStem', 'leftStem', 'grass1', 'grass2', 'grass3', 'grass4', 'leaf1', 'leaf2', 'leaf1b'], height: 100 },
  stage2: { scroll: 0.12, elements: ['grass5', 'grass6', 'grass7', 'grass8', 'branch1', 'branch2', 'branch2b', 'leaf3', 'leaf4', 'leaf5', 'leaf6', 'leaf6b'], height: 180 },
  stage3: { scroll: 0.28, elements: ['branch3', 'branch4', 'branch4b', 'leaf7', 'leaf8', 'leaf9', 'leaf10', 'leaf10b', 'bud1', 'bud1b', 'dot1', 'dot2'], height: 260 },
  stage4: { scroll: 0.42, elements: ['branch5', 'branch6', 'branch6b', 'leaf11', 'leaf12', 'leaf13', 'leaf14', 'leaf14b', 'flower1', 'flower2', 'flower1b', 'bud2', 'bud2b', 'dot3', 'dot4'], height: 340 },
  stage5: { scroll: 0.58, elements: ['branch7', 'branch8', 'branch8b', 'leaf15', 'leaf16', 'leaf16b', 'flower3', 'flower4', 'flower3b', 'bud3', 'bud3b', 'dot5', 'dot6', 'dot6b'], height: 400 },
  stage6: { scroll: 0.72, elements: ['flower5', 'flower6', 'flower5b', 'butterfly1', 'butterfly2'], height: 450 },
  stage7: { scroll: 0.88, elements: ['flower7', 'flower8', 'flower9', 'flower7b', 'dot7', 'dot7b'], height: 500 },
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
      className={`fixed bottom-0 right-5 md:right-10 pointer-events-none z-40 hidden md:block ${className}`}
      style={{
        width: 'clamp(220px, 25vw, 360px)', // Widened container to fit new stems
        height: `${gardenHeight}px`,
        transition: 'height 0.3s ease-out'
      }}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full overflow-visible"
        viewBox="0 0 360 500" // Expanded ViewBox
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <linearGradient id="stemGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="var(--sage-700, #5A6A4E)" />
            <stop offset="100%" stopColor="var(--sage-500, #8FA07A)" />
          </linearGradient>
        </defs>

        {/* 
          We omit the dense bottom grass here since it will 
          clash with the beautiful new grass footer image,
          and instead let the stems grow directly from the footer.
        */}

        {/* =======================
            MAIN CENTER STEM
            ======================= */}
        <path id="mainStem" className="garden-stem" d="M180 500 Q178 460 182 410 Q178 360 185 300 Q180 240 188 180 Q183 120 190 70" />

        {/* Branch 1 - Lower left */}
        <path id="branch1" className="garden-stem garden-stem-thin" d="M182 410 Q160 395 135 385" />
        {/* Branch 2 - Lower right */}
        <path id="branch2" className="garden-stem garden-stem-thin" d="M182 400 Q205 385 230 380" />

        {/* Branch 3 - Mid left */}
        <path id="branch3" className="garden-stem garden-stem-thin" d="M180 330 Q155 315 125 305" />
        {/* Branch 4 - Mid right */}
        <path id="branch4" className="garden-stem garden-stem-thin" d="M185 320 Q210 305 240 300" />

        {/* Branch 5 - Upper left */}
        <path id="branch5" className="garden-stem garden-stem-thin" d="M183 240 Q158 225 128 218" />
        {/* Branch 6 - Upper right */}
        <path id="branch6" className="garden-stem garden-stem-thin" d="M188 230 Q215 215 245 210" />

        {/* Branch 7 - Top left */}
        <path id="branch7" className="garden-stem garden-stem-thin" d="M186 150 Q165 138 140 132" />
        {/* Branch 8 - Top right */}
        <path id="branch8" className="garden-stem garden-stem-thin" d="M190 140 Q215 128 238 122" />

        {/* Leaves - Center Stem Base */}
        <ellipse id="leaf1" className="garden-leaf" cx="195" cy="460" rx="14" ry="6" transform="rotate(-35 195 460)" />
        <ellipse id="leaf2" className="garden-leaf garden-leaf-light" cx="165" cy="465" rx="13" ry="5" transform="rotate(30 165 465)" />

        {/* Leaves - Center Stem Lower */}
        <ellipse id="leaf3" className="garden-leaf" cx="145" cy="390" rx="14" ry="6" transform="rotate(25 145 390)" />
        <ellipse id="leaf4" className="garden-leaf garden-leaf-dark" cx="220" cy="385" rx="13" ry="6" transform="rotate(-30 220 385)" />
        <ellipse id="leaf5" className="garden-leaf garden-leaf-light" cx="130" cy="378" rx="10" ry="4" transform="rotate(40 130 378)" />
        <ellipse id="leaf6" className="garden-leaf" cx="235" cy="375" rx="11" ry="5" transform="rotate(-35 235 375)" />

        {/* Leaves - Center Stem Mid */}
        <ellipse id="leaf7" className="garden-leaf" cx="135" cy="310" rx="13" ry="6" transform="rotate(30 135 310)" />
        <ellipse id="leaf8" className="garden-leaf garden-leaf-dark" cx="230" cy="305" rx="14" ry="6" transform="rotate(-25 230 305)" />
        <ellipse id="leaf9" className="garden-leaf garden-leaf-light" cx="120" cy="298" rx="10" ry="4" transform="rotate(45 120 298)" />
        <ellipse id="leaf10" className="garden-leaf" cx="245" cy="295" rx="11" ry="5" transform="rotate(-40 245 295)" />

        {/* Leaves - Center Stem Upper */}
        <ellipse id="leaf11" className="garden-leaf" cx="138" cy="222" rx="12" ry="5" transform="rotate(35 138 222)" />
        <ellipse id="leaf12" className="garden-leaf garden-leaf-dark" cx="235" cy="215" rx="13" ry="5" transform="rotate(-30 235 215)" />
        <ellipse id="leaf13" className="garden-leaf garden-leaf-light" cx="122" cy="212" rx="9" ry="4" transform="rotate(40 122 212)" />
        <ellipse id="leaf14" className="garden-leaf" cx="250" cy="205" rx="10" ry="4" transform="rotate(-35 250 205)" />

        {/* Leaves - Center Stem Top */}
        <ellipse id="leaf15" className="garden-leaf" cx="148" cy="138" rx="11" ry="4" transform="rotate(30 148 138)" />
        <ellipse id="leaf16" className="garden-leaf garden-leaf-dark" cx="230" cy="128" rx="12" ry="4" transform="rotate(-25 230 128)" />

        {/* Buds - Center */}
        <ellipse id="bud1" className="garden-bud" cx="125" cy="300" rx="4" ry="7" />
        <ellipse id="bud2" className="garden-bud" cx="245" cy="210" rx="3" ry="6" />
        <ellipse id="bud3" className="garden-bud" cx="140" cy="130" rx="3" ry="5" />


        {/* =======================
            LEFT SECONDARY STEM
            ======================= */}
        <path id="leftStem" className="garden-stem garden-stem-thin" d="M80 500 Q70 420 85 340 Q95 260 75 160" />

        {/* Branches */}
        <path id="branch2b" className="garden-stem garden-stem-thin" d="M82 380 Q55 375 35 365" />
        <path id="branch4b" className="garden-stem garden-stem-thin" d="M85 300 Q110 285 130 270" />
        <path id="branch6b" className="garden-stem garden-stem-thin" d="M80 220 Q50 210 30 195" />

        {/* Leaves */}
        <ellipse id="leaf1b" className="garden-leaf garden-leaf-light" cx="65" cy="440" rx="12" ry="5" transform="rotate(25 65 440)" />
        <ellipse id="leaf6b" className="garden-leaf" cx="45" cy="360" rx="11" ry="5" transform="rotate(35 45 360)" />
        <ellipse id="leaf10b" className="garden-leaf garden-leaf-dark" cx="115" cy="275" rx="10" ry="4" transform="rotate(-40 115 275)" />
        <ellipse id="leaf14b" className="garden-leaf" cx="40" cy="190" rx="10" ry="4" transform="rotate(35 40 190)" />

        {/* Buds */}
        <ellipse id="bud1b" className="garden-bud" cx="30" cy="360" rx="3" ry="6" />
        <ellipse id="bud2b" className="garden-bud" cx="135" cy="265" rx="3" ry="5" />

        {/* =======================
            RIGHT THICK SECONDARY STEM
            ======================= */}
        <path id="rightStem" className="garden-stem" d="M280 500 Q290 400 275 280 Q260 160 285 80" />

        {/* Branches */}
        <path id="branch1b" className="garden-stem garden-stem-thin" d="M285 410 Q310 395 330 380" />
        <path id="branch3b" className="garden-stem garden-stem-thin" d="M275 320 Q245 305 220 295" />
        <path id="branch5b" className="garden-stem garden-stem-thin" d="M272 230 Q295 210 320 200" />
        <path id="branch7b" className="garden-stem garden-stem-thin" d="M265 150 Q240 140 215 135" />

        {/* Leaves */}
        <ellipse id="leaf3b" className="garden-leaf" cx="315" cy="385" rx="12" ry="5" transform="rotate(-35 315 385)" />
        <ellipse id="leaf7b" className="garden-leaf garden-leaf-dark" cx="230" cy="290" rx="11" ry="5" transform="rotate(25 230 290)" />
        <ellipse id="leaf11b" className="garden-leaf" cx="305" cy="205" rx="10" ry="4" transform="rotate(-45 305 205)" />
        <ellipse id="leaf15b" className="garden-leaf garden-leaf-light" cx="225" cy="140" rx="9" ry="4" transform="rotate(30 225 140)" />

        {/* Buds */}
        <ellipse id="bud3b" className="garden-bud" cx="335" cy="375" rx="4" ry="6" />
        <ellipse id="bud4b" className="garden-bud" cx="205" cy="130" rx="3" ry="5" />


        {/* =======================
            MAIN STEM FLOWERS
            ======================= */}

        {/* Flower 1 - Terracotta (Lower right) */}
        <g id="flower1" className="garden-flower">
          <ellipse className="petal-terracotta" cx="230" cy="375" rx="10" ry="16" transform="rotate(-15 230 375)" />
          <ellipse className="petal-terracotta-light" cx="237" cy="369" rx="10" ry="16" transform="rotate(25 237 369)" />
          <ellipse className="petal-terracotta" cx="225" cy="365" rx="10" ry="16" transform="rotate(-55 225 365)" />
          <ellipse className="petal-terracotta-light" cx="243" cy="379" rx="10" ry="16" transform="rotate(65 243 379)" />
          <ellipse className="petal-terracotta" cx="233" cy="385" rx="10" ry="16" transform="rotate(100 233 385)" />
          <circle className="flower-center" cx="233" cy="373" r="6" />
        </g>

        {/* Flower 2 - Ochre (Lower left) */}
        <g id="flower2" className="garden-flower">
          <ellipse className="petal-ochre" cx="135" cy="385" rx="9" ry="14" transform="rotate(20 135 385)" />
          <ellipse className="petal-ochre-dark" cx="128" cy="379" rx="9" ry="14" transform="rotate(-20 128 379)" />
          <ellipse className="petal-ochre" cx="140" cy="377" rx="9" ry="14" transform="rotate(60 140 377)" />
          <ellipse className="petal-ochre-dark" cx="125" cy="387" rx="9" ry="14" transform="rotate(-60 125 387)" />
          <ellipse className="petal-ochre" cx="132" cy="393" rx="9" ry="14" transform="rotate(-100 132 393)" />
          <circle className="flower-center-dark" cx="132" cy="383" r="5" />
        </g>

        {/* Flower 3 - Terracotta (Mid right) */}
        <g id="flower3" className="garden-flower">
          <ellipse className="petal-terracotta-light" cx="240" cy="295" rx="8" ry="13" transform="rotate(-10 240 295)" />
          <ellipse className="petal-terracotta" cx="246" cy="290" rx="8" ry="13" transform="rotate(30 246 290)" />
          <ellipse className="petal-terracotta-light" cx="235" cy="287" rx="8" ry="13" transform="rotate(-50 235 287)" />
          <ellipse className="petal-terracotta" cx="249" cy="300" rx="8" ry="13" transform="rotate(70 249 300)" />
          <circle className="flower-center" cx="241" cy="294" r="5" />
        </g>

        {/* Flower 4 - Ochre (Mid left) */}
        <g id="flower4" className="garden-flower">
          <ellipse className="petal-ochre-dark" cx="125" cy="305" rx="8" ry="12" transform="rotate(15 125 305)" />
          <ellipse className="petal-ochre" cx="119" cy="300" rx="8" ry="12" transform="rotate(-25 119 300)" />
          <ellipse className="petal-ochre-dark" cx="129" cy="298" rx="8" ry="12" transform="rotate(55 129 298)" />
          <ellipse className="petal-ochre" cx="117" cy="308" rx="8" ry="12" transform="rotate(-65 117 308)" />
          <circle className="flower-center" cx="123" cy="303" r="4" />
        </g>

        {/* Flower 5 - Terracotta (Upper right) */}
        <g id="flower5" className="garden-flower">
          <ellipse className="petal-terracotta" cx="245" cy="205" rx="9" ry="14" transform="rotate(-5 245 205)" />
          <ellipse className="petal-terracotta-light" cx="252" cy="199" rx="9" ry="14" transform="rotate(35 252 199)" />
          <ellipse className="petal-terracotta" cx="239" cy="196" rx="9" ry="14" transform="rotate(-45 239 196)" />
          <ellipse className="petal-terracotta-light" cx="255" cy="210" rx="9" ry="14" transform="rotate(75 255 210)" />
          <ellipse className="petal-terracotta" cx="247" cy="215" rx="9" ry="14" transform="rotate(105 247 215)" />
          <circle className="flower-center-dark" cx="247" cy="204" r="5" />
        </g>

        {/* Flower 6 - Ochre (Upper left) */}
        <g id="flower6" className="garden-flower">
          <ellipse className="petal-ochre" cx="128" cy="218" rx="8" ry="12" transform="rotate(10 128 218)" />
          <ellipse className="petal-ochre-dark" cx="122" cy="213" rx="8" ry="12" transform="rotate(-30 122 213)" />
          <ellipse className="petal-ochre" cx="132" cy="211" rx="8" ry="12" transform="rotate(50 132 211)" />
          <ellipse className="petal-ochre-dark" cx="120" cy="221" rx="8" ry="12" transform="rotate(-70 120 221)" />
          <circle className="flower-center" cx="126" cy="216" r="4" />
        </g>

        {/* Crown Flower 7 - Terracotta (Top right) */}
        <g id="flower7" className="garden-flower">
          <ellipse className="petal-terracotta-light" cx="238" cy="118" rx="10" ry="15" transform="rotate(-8 238 118)" />
          <ellipse className="petal-terracotta" cx="246" cy="111" rx="10" ry="15" transform="rotate(32 246 111)" />
          <ellipse className="petal-terracotta-light" cx="231" cy="108" rx="10" ry="15" transform="rotate(-48 231 108)" />
          <ellipse className="petal-terracotta" cx="250" cy="123" rx="10" ry="15" transform="rotate(72 250 123)" />
          <ellipse className="petal-terracotta-light" cx="238" cy="131" rx="10" ry="15" transform="rotate(108 238 131)" />
          <circle className="flower-center" cx="240" cy="117" r="6" />
        </g>

        {/* Crown Flower 8 - Ochre (Top left) */}
        <g id="flower8" className="garden-flower">
          <ellipse className="petal-ochre-dark" cx="140" cy="128" rx="8" ry="12" transform="rotate(12 140 128)" />
          <ellipse className="petal-ochre" cx="134" cy="122" rx="8" ry="12" transform="rotate(-28 134 122)" />
          <ellipse className="petal-ochre-dark" cx="144" cy="120" rx="8" ry="12" transform="rotate(52 144 120)" />
          <ellipse className="petal-ochre" cx="132" cy="131" rx="8" ry="12" transform="rotate(-68 132 131)" />
          <circle className="flower-center-dark" cx="138" cy="125" r="4" />
        </g>

        {/* Top Crown - Main Center Flower */}
        <g id="flower9" className="garden-flower">
          <ellipse className="petal-terracotta" cx="190" cy="60" rx="12" ry="18" transform="rotate(0 190 60)" />
          <ellipse className="petal-terracotta-light" cx="200" cy="52" rx="12" ry="18" transform="rotate(40 200 52)" />
          <ellipse className="petal-terracotta" cx="180" cy="50" rx="12" ry="18" transform="rotate(-40 180 50)" />
          <ellipse className="petal-terracotta-light" cx="205" cy="68" rx="12" ry="18" transform="rotate(80 205 68)" />
          <ellipse className="petal-terracotta" cx="175" cy="70" rx="12" ry="18" transform="rotate(-80 175 70)" />
          <circle className="flower-center-dark" cx="190" cy="62" r="7" />
        </g>


        {/* =======================
            SIDE STEM FLOWERS
            ======================= */}

        {/* Flower 1b - Left Ochre */}
        <g id="flower1b" className="garden-flower">
          <ellipse className="petal-ochre" cx="25" cy="195" rx="8" ry="12" transform="rotate(-20 25 195)" />
          <ellipse className="petal-ochre-dark" cx="32" cy="190" rx="8" ry="12" transform="rotate(20 32 190)" />
          <ellipse className="petal-ochre" cx="20" cy="188" rx="8" ry="12" transform="rotate(-60 20 188)" />
          <ellipse className="petal-ochre-dark" cx="35" cy="200" rx="8" ry="12" transform="rotate(60 35 200)" />
          <ellipse className="petal-ochre" cx="28" cy="205" rx="8" ry="12" transform="rotate(100 28 205)" />
          <circle className="flower-center-dark" cx="28" cy="195" r="4" />
        </g>

        {/* Flower 3b - Left Terracotta Crown */}
        <g id="flower3b" className="garden-flower">
          <ellipse className="petal-terracotta" cx="75" cy="155" rx="9" ry="14" transform="rotate(-15 75 155)" />
          <ellipse className="petal-terracotta-light" cx="82" cy="150" rx="9" ry="14" transform="rotate(25 82 150)" />
          <ellipse className="petal-terracotta" cx="70" cy="148" rx="9" ry="14" transform="rotate(-55 70 148)" />
          <ellipse className="petal-terracotta" cx="85" cy="162" rx="9" ry="14" transform="rotate(65 85 162)" />
          <circle className="flower-center" cx="78" cy="153" r="5" />
        </g>

        {/* Flower 5b - Right Ochre */}
        <g id="flower5b" className="garden-flower">
          <ellipse className="petal-ochre-dark" cx="220" cy="290" rx="7" ry="10" transform="rotate(10 220 290)" />
          <ellipse className="petal-ochre" cx="215" cy="285" rx="7" ry="10" transform="rotate(-30 215 285)" />
          <ellipse className="petal-ochre-dark" cx="227" cy="284" rx="7" ry="10" transform="rotate(50 227 284)" />
          <ellipse className="petal-ochre" cx="212" cy="293" rx="7" ry="10" transform="rotate(-70 212 293)" />
          <circle className="flower-center" cx="218" cy="288" r="3" />
        </g>

        {/* Flower 7b - Right Terracotta Crown */}
        <g id="flower7b" className="garden-flower">
          <ellipse className="petal-terracotta" cx="280" cy="75" rx="10" ry="15" transform="rotate(5 280 75)" />
          <ellipse className="petal-terracotta-light" cx="288" cy="70" rx="10" ry="15" transform="rotate(45 288 70)" />
          <ellipse className="petal-terracotta" cx="272" cy="68" rx="10" ry="15" transform="rotate(-35 272 68)" />
          <ellipse className="petal-terracotta-light" cx="292" cy="82" rx="10" ry="15" transform="rotate(85 292 82)" />
          <ellipse className="petal-terracotta" cx="278" cy="86" rx="10" ry="15" transform="rotate(-75 278 86)" />
          <circle className="flower-center-dark" cx="282" cy="77" r="6" />
        </g>


        {/* =======================
            DECORATIONS (Dots & Butterflies)
            ======================= */}

        <circle id="dot1" className="garden-dot" cx="255" cy="400" r="2.5" />
        <circle id="dot2" className="garden-dot" cx="110" cy="395" r="2" />
        <circle id="dot3" className="garden-dot" cx="260" cy="320" r="1.5" />
        <circle id="dot4" className="garden-dot" cx="105" cy="315" r="2.5" />
        <circle id="dot5" className="garden-dot" cx="265" cy="235" r="2" />
        <circle id="dot6" className="garden-dot" cx="100" cy="230" r="1.5" />
        <circle id="dot6b" className="garden-dot" cx="40" cy="150" r="2" />
        <circle id="dot7" className="garden-dot" cx="190" cy="40" r="2.5" />
        <circle id="dot7b" className="garden-dot" cx="300" cy="100" r="1.5" />

        {/* Butterfly 1 (Right) */}
        <g id="butterfly1" className="garden-butterfly">
          <ellipse className="butterfly-wing" cx="265" cy="160" rx="8" ry="5" transform="rotate(-20 265 160)" fill="#D6A48F" />
          <ellipse className="butterfly-wing" cx="273" cy="158" rx="8" ry="5" transform="rotate(20 273 158)" fill="#D6A48F" />
          <ellipse className="butterfly-body" cx="269" cy="162" rx="2" ry="6" fill="#415C49" />
        </g>

        {/* Butterfly 2 (Left) */}
        <g id="butterfly2" className="garden-butterfly">
          <ellipse className="butterfly-wing-dark" cx="95" cy="245" rx="7" ry="4" transform="rotate(15 95 245)" fill="#6A8A7A" />
          <ellipse className="butterfly-wing-dark" cx="87" cy="242" rx="7" ry="4" transform="rotate(-25 87 242)" fill="#6A8A7A" />
          <ellipse className="butterfly-body" cx="91" cy="244" rx="1.5" ry="5" fill="#415C49" />
        </g>
      </svg>
    </div>
  );
}

export default GardenAnimation;
