import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "Duckert Design",
  description: "Professionelt webdesign, UI/UX og webudvikling til virksomheder der vil stå stærkt online. Duckert Design Studio, Danmark.",
  keywords: ["webdesign", "webudvikling", "UI/UX", "digital", "Danmark"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da">
      <body>
        <Header />
        {children}
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
