import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mit Duckert Design",
  robots: "noindex, nofollow",
};

export default function MitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#f7f8fc" }}>
      {children}
    </div>
  );
}
