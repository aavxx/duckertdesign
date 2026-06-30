import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mit Duckert Design",
  robots: { index: false, follow: false },
};

export default function MitLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ height: "100dvh", overflow: "hidden" }}>{children}</div>;
}
