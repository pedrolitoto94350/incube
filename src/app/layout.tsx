import type { Metadata } from "next";
import "./globals.css";
import CookieConsentBanner from "@/components/CookieConsent";
import { GoogleAnalytics } from "@next/third-parties/google";

const GA_ID = "G-79K3RW5K04";

export const metadata: Metadata = {
  title: "InCube — Le matching équitable devs & missions",
  description:
    "Plateforme de matching entre développeurs juniors et employeurs. Matching aléatoire équitable, zéro engagement après le match, commission unique de 300€.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="PKV5XbzBZwjjYmZq9fqh-aSbxfFpciq_lNXsTkV_OS0" />
      </head>
      <body className="antialiased bg-gray-50 text-gray-900 min-h-screen">
        {children}
        <CookieConsentBanner />
        <GoogleAnalytics gaId={GA_ID} />
      </body>
    </html>
  );
}
