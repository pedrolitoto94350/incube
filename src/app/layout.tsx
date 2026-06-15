import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InCube — Le matching équitable devs & missions",
  description:
    "Plateforme de matching entre développeurs juniors et employeurs. Matching aléatoire équitable, zéro engagement après le match, commission unique de 300€.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased bg-gray-50 text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
