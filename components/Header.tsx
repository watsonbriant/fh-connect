"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_ITEMS: { label: string; href: string; children: { label: string; href: string }[] }[] = [
  { label: "Join Us.", href: "#", children: [{ label: "Placeholder", href: "#" }] },
  { label: "Who We Are.", href: "#", children: [{ label: "Placeholder", href: "#" }] },
  { label: "Get Connected.", href: "#", children: [{ label: "Placeholder", href: "#" }] },
  { label: "Your Next Steps.", href: "#", children: [{ label: "Placeholder", href: "#" }] },
  { label: "Watch + Listen.", href: "#", children: [{ label: "Placeholder", href: "#" }] },
  { label: "Get Support.", href: "#", children: [{ label: "Placeholder", href: "#" }] },
  { label: "Pray + Give.", href: "#", children: [{ label: "Placeholder", href: "#" }] },
];

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full text-brand-white shadow-[0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-none" style={{ backgroundColor: '#000000', isolation: 'isolate' }}>
      <div className="mx-auto flex h-14 min-h-[44px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo: full height of header with py-2, width natural */}
        <Link
          href="/"
          className="flex h-full shrink-0 py-3"
          aria-label="Freedom House home"
        >
          <img
            src="/logo-white.png"
            alt="Freedom House"
            className="h-full w-auto object-contain hover:scale-105 transition-transform duration-200"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                className="min-h-[44px] px-3 py-2 text-sm font-medium text-brand-white hover:text-brand-tan focus:outline-none focus:ring-2 focus:ring-brand-tan focus:ring-inset"
                aria-expanded={openDropdown === item.label}
                aria-haspopup="true"
                onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
              >
                {item.label}
              </button>
              {item.children.length > 0 && (
                <div
                  className={`absolute left-0 top-full min-w-[180px] rounded border border-brand-black/20 bg-brand-white py-1 shadow-lg transition-all duration-200 ${
                    openDropdown === item.label
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}
                  role="menu"
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      className="block px-4 py-2 text-sm text-brand-black hover:bg-brand-tan/20 focus:bg-brand-tan/20 focus:outline-none"
                      role="menuitem"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-brand-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-tan md:hidden"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">{mobileMenuOpen ? "Close menu" : "Open menu"}</span>
          {mobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile nav */}
      <div
        id="mobile-nav"
        className={`border-t border-white/10 bg-brand-black md:hidden ${mobileMenuOpen ? "block" : "hidden"}`}
        aria-hidden={!mobileMenuOpen}
      >
        <nav className="flex flex-col py-2" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="border-b border-white/10 last:border-0">
              <button
                type="button"
                className="flex w-full min-h-[44px] items-center justify-between px-4 py-3 text-left text-sm font-medium text-brand-white hover:bg-white/5"
                onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                aria-expanded={openDropdown === item.label}
              >
                {item.label}
                <svg
                  className={`h-4 w-4 shrink-0 transition-transform ${openDropdown === item.label ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {item.children.length > 0 && (
                <div
                  className={`bg-black/30 px-4 pb-2 transition-all duration-200 overflow-hidden ${
                    openDropdown === item.label
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      className="block min-h-[44px] py-2 pl-4 text-sm text-brand-white/90 hover:text-brand-tan"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}
