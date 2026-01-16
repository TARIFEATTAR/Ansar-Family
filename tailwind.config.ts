import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ============================================
         ANSAR FAMILY - Custom Color Palette
         "Quiet luxury meets warm hospitality"
         ============================================ */
      colors: {
        ansar: {
          // Primary Backgrounds
          cream: "#F8F6F1",
          "cream-warm": "#F5F2EB",
          "off-white": "#F3EFE7",
          "soft-white": "#FAFAF8",
          "warm-gray": "#EDE9E1",

          // Text Colors
          charcoal: "#3D3D3D",
          gray: "#5A5A5A",
          muted: "#8A8A85",

          // Garden Greens (Sage Family)
          sage: {
            50: "#F4F6F2",
            100: "#E8ECE4",
            200: "#D4DBC9",
            300: "#C4CDB9",
            400: "#A8B89A",
            500: "#8FA07A",
            600: "#7D8B6A",
            700: "#6B7D5C",
            800: "#5A6A4E",
            900: "#4A5840",
          },

          // Terracotta/Clay Reds
          terracotta: {
            50: "#FBF6F4",
            100: "#F5EAE6",
            200: "#EBDAD4",
            300: "#D4A89A",
            400: "#C9968A",
            500: "#C4887A",
            600: "#B87D6E",
            700: "#A86D5E",
            800: "#8B5A4E",
            900: "#6E4840",
          },

          // Ochre/Gold
          ochre: {
            50: "#FAF8F2",
            100: "#F5F0E4",
            200: "#E8D9B5",
            300: "#D4C49A",
            400: "#C9B896",
            500: "#BCA87A",
            600: "#A8956A",
            700: "#8F7D58",
            800: "#736548",
            900: "#5C503A",
          },

          // Earth Tones
          earth: {
            100: "#E8E2DA",
            200: "#D4CBC0",
            300: "#BFB3A5",
          },
        },
      },

      /* ============================================
         TYPOGRAPHY
         ============================================ */
      fontFamily: {
        display: [
          "var(--font-cormorant)",
          "Cormorant Garamond",
          "Georgia",
          "Times New Roman",
          "serif",
        ],
        heading: [
          "var(--font-cormorant)",
          "Cormorant Garamond",
          "Georgia",
          "Times New Roman",
          "serif",
        ],
        body: [
          "var(--font-outfit)",
          "Outfit",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },

      fontSize: {
        // Fluid typography scale
        xs: ["clamp(0.7rem, 0.65rem + 0.25vw, 0.75rem)", { lineHeight: "1.5" }],
        sm: ["clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem)", { lineHeight: "1.5" }],
        base: ["clamp(0.95rem, 0.9rem + 0.25vw, 1rem)", { lineHeight: "1.6" }],
        lg: ["clamp(1.1rem, 1rem + 0.5vw, 1.25rem)", { lineHeight: "1.6" }],
        xl: ["clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)", { lineHeight: "1.4" }],
        "2xl": ["clamp(1.5rem, 1.25rem + 1.25vw, 2rem)", { lineHeight: "1.3" }],
        "3xl": ["clamp(2rem, 1.5rem + 2.5vw, 3rem)", { lineHeight: "1.2" }],
        "4xl": ["clamp(2.5rem, 2rem + 2.5vw, 4rem)", { lineHeight: "1.15" }],
        "5xl": ["clamp(3rem, 2.5rem + 2.5vw, 5rem)", { lineHeight: "1.1" }],
      },

      /* ============================================
         SPACING & LAYOUT
         ============================================ */
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
      },

      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },

      /* ============================================
         BORDERS & SHADOWS
         ============================================ */
      borderRadius: {
        "4xl": "2rem",
      },

      boxShadow: {
        soft: "0 4px 20px rgba(61, 61, 61, 0.04)",
        medium: "0 8px 30px rgba(61, 61, 61, 0.08)",
        strong: "0 12px 40px rgba(61, 61, 61, 0.12)",
      },

      /* ============================================
         ANIMATIONS & TRANSITIONS
         ============================================ */
      transitionTimingFunction: {
        "ease-out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-in-out-expo": "cubic-bezier(0.65, 0, 0.35, 1)",
      },

      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
      },

      animation: {
        "fade-in-up": "fadeInUp 0.6s cubic-bezier(0.19, 1, 0.22, 1) forwards",
        "float": "float 3s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },

      keyframes: {
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        "pulse-soft": {
          "0%, 100%": {
            opacity: "0.6",
          },
          "50%": {
            opacity: "1",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
