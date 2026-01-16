import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Ansar Family | Every Heart Rooted",
  description: "The infrastructure layer for supporting New Muslims and those returning to Islam. We provide the toolkit so local communities can focus on people, not paperwork.",
  keywords: ["Ansar", "New Muslim", "Convert", "Islam", "Community", "Support"],
  authors: [{ name: "Ansar Family" }],
  openGraph: {
    title: "Ansar Family | Every Heart Rooted",
    description: "The infrastructure layer for supporting New Muslims and those returning to Islam.",
    type: "website",
    url: "https://ansar.family",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${cormorantGaramond.variable} ${outfit.variable}`}>
        <body className="bg-ansar-cream text-ansar-charcoal antialiased">
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
