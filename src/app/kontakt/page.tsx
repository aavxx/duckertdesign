import Contact from "@/components/Contact";

export const metadata = {
  title: "Kontakt – Duckert Design",
  description: "Tag kontakt til Duckert Design. Vi vender tilbage inden for 24 timer.",
};

export default function KontaktPage() {
  return (
    <main style={{ paddingTop: "96px" }}>
      <Contact />
    </main>
  );
}
