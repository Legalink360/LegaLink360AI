"use client";

export default function Footer() {
  const links = [
    { label: "Terms & Conditions", href: "https://legalink360.com/terms" },
    { label: "Privacy Policy", href: "https://legalink360.com/privacy-policy" },
    { label: "About Us", href: "https://legalink360.com/about" },
    { label: "Contact Us", href: "https://legalink360.com/contact" },
    { label: "Help & Support", href: "https://legalink360.com/help" },
  ];

  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-4 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-400">
          {links.map((link, idx) => (
            <div key={idx} className="flex items-center gap-6">
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                {link.label}
              </a>
              {idx < links.length - 1 && (
                <span className="text-slate-300 dark:text-slate-600">•</span>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-3 text-xs text-slate-500 dark:text-slate-500">
          © 2026 LegaLink & Co. Advocates. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
