import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <p className="text-sm text-text-muted">
          &copy; {new Date().getFullYear()} Real Estate Analyzer
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/terms"
            className="text-sm text-text-muted hover:text-text transition-colors"
          >
            Terms &amp; Conditions
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-text-muted hover:text-text transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/contact"
            className="text-sm text-text-muted hover:text-text transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
