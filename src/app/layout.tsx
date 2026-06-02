import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Duckert Design – Webdesign der skiller sig ud",
  description: "Vi skaber minimalistiske og effektive digitale oplevelser. Webdesign, branding og UI/UX for virksomheder der vil mere.",
  keywords: ["webdesign", "branding", "UI/UX", "digital", "Danmark"],
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
        <div style={{ background: "#1647FB" }}>
          <Footer />
        </div>
      </body>
    </html>
  );
}
