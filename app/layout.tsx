import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "Way Off — Your Brain vs. Reality",
  description:
    "A daily estimation game. Guess real-world numbers with hot/cold feedback. One question per day, five guesses, spoiler-free sharing.",
  openGraph: {
    title: "Way Off — Your Brain vs. Reality",
    description: "How close is your instinct? Daily number guessing game.",
    type: "website",
  },
  other: {
    "theme-color": "#0F172A",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} font-sans text-text-primary antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
