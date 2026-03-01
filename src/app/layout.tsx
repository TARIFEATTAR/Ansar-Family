import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import "./globals.css";

/**
 * ANSAR FAMILY — Root Layout
 * Typography: Cormorant Garamond (headings) + Outfit (body)
 * Auth: Clerk for authentication
 * Data: Convex for real-time backend
 */

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ansar.family"),
  title: "Ansar Family",
  description: "The infrastructure layer for supporting New Muslims and those returning to Islam. We provide the toolkit so local communities can focus on people, not paperwork.",
  keywords: ["Ansar", "New Muslim", "Convert", "Islam", "Community", "Support"],
  authors: [{ name: "Ansar Family" }],
  openGraph: {
    title: "Ansar Family",
    description: "The infrastructure layer for supporting New Muslims and those returning to Islam.",
    type: "website",
    url: "https://ansar.family",
    siteName: "Ansar Family",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ansar Family",
    description: "The infrastructure layer for supporting New Muslims and those returning to Islam.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider telemetry={false}>
      <html lang="en" className={`${cormorantGaramond.variable} ${outfit.variable} ${playfairDisplay.variable}`} style={{ scrollBehavior: 'smooth' }}>
        <head>
          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          <script src="https://mcp.figma.com/mcp/html-to-design/capture.js"></script>
        </head>
        <body className="bg-ansar-cream text-ansar-charcoal antialiased">
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
