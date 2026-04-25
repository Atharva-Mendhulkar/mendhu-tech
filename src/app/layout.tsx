import { EB_Garamond, JetBrains_Mono } from "next/font/google";
import LogBar from "@/components/LogBar";
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
  title: "Atharva Mendhulkar — mendhu.tech",
  description: "Systems Engineer & AI Researcher. Physics-Informed ML, Kernel Systems, SaaS. VIT Vellore.",
  metadataBase: new URL("https://mendhu.tech"),
  icons: {
    icon: "/porygon.svg",
  },
  openGraph: {
    title: "Atharva Mendhulkar",
    description: "Systems Engineer & AI Researcher",
    url: "https://mendhu.tech",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${jetbrainsMono.variable}`}>
      <body>
        <LogBar />
        {children}
      </body>
    </html>
  );
}
