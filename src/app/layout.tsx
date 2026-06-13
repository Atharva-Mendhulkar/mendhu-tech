import { EB_Garamond, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import LogBarServer from "@/components/LogBarServer";
import ToastProvider from "@/components/ToastProvider";
import CustomCursor from "@/components/CustomCursor";
import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["300", "400", "500"],
});

export const metadata = {
  title: "Atharva Mendhulkar | Systems Engineer & AI Researcher",
  description: "Atharva Mendhulkar — Systems Engineer & AI Researcher specializing in physics-informed ML, kernel infrastructure, and agentic systems.",
  alternates: {
    canonical: '/',
  },
  keywords: ["Atharva Mendhulkar", "Systems Engineer", "AI Researcher", "PINNs", "Machine Learning", "Kernel Development", "Agentic Systems", "Digital Garden", "Agentic AI", "LLMs", "Assitive Devices", "AI", "Systems", "Embedded Systems", "Systems Programming", "Full Stack Developer", "Machine Learning Engineer"],
  metadataBase: new URL("https://www.mendhu.tech"),
  authors: [{ name: "Atharva Mendhulkar" }],
  creator: "Atharva Mendhulkar",
  icons: {
    icon: "/porygon.svg",
    shortcut: "/porygon.svg",
    apple: "/porygon.svg",
  },
  openGraph: {
    title: "Atharva Mendhulkar | Systems Engineer & AI Researcher",
    description: "Exploring the intersection of physics-informed machine learning and kernel-level infrastructure.",
    url: "https://www.mendhu.tech",
    siteName: "Atharva Mendhulkar Portfolio",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Atharva Mendhulkar — Systems Engineer & AI Researcher",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atharva Mendhulkar | Systems Engineer & AI Researcher",
    description: "Exploring the intersection of physics-informed machine learning and kernel-level infrastructure.",
    creator: "@atharvarta",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${jetbrainsMono.variable}`}>
      <body>
        <CustomCursor />
        <LogBarServer />
        <ToastProvider />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
