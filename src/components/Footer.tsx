import Logo from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <Logo className="h-8 w-auto" />
        <p className="text-sm text-gray-400 font-light">
          © {year} Duckert Design. Alle rettigheder forbeholdt.
        </p>
        <div className="flex gap-6 text-sm text-gray-400">
          <a href="mailto:hej@duckertdesign.dk" className="hover:text-[#1647FB] transition-colors duration-200">
            hej@duckertdesign.dk
          </a>
        </div>
      </div>
    </footer>
  );
}
