"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_ITEMS: { label: string; href: string; children: { label: string; href: string }[] }[] = [
  { label: "Join Us.", href: "#", children: [] },
  { label: "Who We Are.", href: "#", children: [{ label: "Sit With Me", href: "#" }, { label: "Vision + Beliefs", href: "#" }, { label: "Our Campuses", href: "#" }, { label: "Our Pastors", href: "#" }, { label: "Job Openings", href: "#" }, { label: "Download the FH App", href: "#" }] },
  { label: "Get Connected.", href: "#", children: [{ label: "Connect With Us", href: "#" }, { label: "Upcoming Events", href: "#" }, { label: "Join a LifeGroup", href: "#" }, { label: "FHKids", href: "#" }, { label: "Vertical Youth", href: "#" }, { label: "MVMNT Young Adults", href: "#" }, { label: "Strong Men", href: "#" }, { label: "Authentic Women", href: "#" }, { label: "FHConnect", href: "#" }] },
  { label: "Your Next Steps.", href: "#", children: [{ label: "Join The FH Family", href: "#" }, { label: "Serve in the Church", href: "#" }, { label: "Serve Charlotte", href: "#" }, { label: "Serve Around the World", href: "#" }, { label: "Get Baptized", href: "#" }, { label: "Move Forward", href: "#" }, { label: "Internship", href: "#" }, { label: "TPUSA Faith", href: "#" }] },
  { label: "Watch + Listen.", href: "#", children: [{ label: "Watch Live Online", href: "#" }, { label: "Previous Messages", href: "#" }, { label: "Worship", href: "#" }, { label: "YouTube", href: "#" }, { label: "Podcast", href: "#" }] },
  { label: "Get Support.", href: "#", children: [{ label: "Placeholder", href: "#" }, { label: "Care", href: "#" }, { label: "Prayer", href: "#" }] },
  { label: "Freedom Academy", href: "https://freedomacademync.cc", children: [] },
];

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full tracking-tight text-brand-white shadow-[0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-none" style={{ backgroundColor: '#000000', isolation: 'isolate' }}>
      <div className="relative mx-auto flex h-14 min-h-[44px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Spacer for mobile so logo can be centered (same width as hamburger) */}
        <div className="w-11 shrink-0 xl:hidden" aria-hidden />
        {/* Logo: centered on mobile, left-aligned on desktop */}
        <Link
          href="/"
          className="absolute left-1/2 flex h-full shrink-0 -translate-x-1/2 py-3 xl:static xl:left-auto xl:translate-x-0"
          aria-label="Freedom House home"
        >
          <img
            src="/logo-white.png"
            alt="Freedom House"
            className="h-full w-auto object-contain hover:scale-105 transition-transform duration-200"
          />
        </Link>

        {/* Desktop nav and Give button — only when viewport is 7xl (1280px) or wider */}
        <div className="hidden items-center gap-1 xl:flex">
          <nav className="flex items-center gap-1" aria-label="Main">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children.length > 0 && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {item.children.length === 0 ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs font-[600] tracking-tight text-brand-white hover:text-brand-tan"
                  >
                    {item.label}
                  </a>
                ) : (
                  <>
                    <button
                      type="button"
                      className="px-3 py-2 text-xs font-[600] tracking-tight text-brand-white hover:text-brand-tan"
                      aria-expanded={openDropdown === item.label}
                      aria-haspopup="true"
                      onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                    >
                      {item.label}
                    </button>
                    {item.children.length > 0 && (
                  <div
                    className={`absolute left-0 top-full min-w-[180px] rounded border border-brand-black/20 bg-brand-white shadow-lg transition-all duration-200 ${
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
                        className="block px-4 py-1 text-xs tracking-tight text-brand-black hover:bg-brand-tan/80"
                        role="menuitem"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </nav>
          <Link
            href="#"
            className="items-center justify-center rounded bg-brand-tan px-2 py-1 text-sm font-semibold tracking-tight text-brand-black hover:bg-brand-tan/90 ml-4"
          >
            Give
          </Link>
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-brand-white hover:text-brand-tan ml-2"
            aria-label="Account: log in, sign up, or log out"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </button>
        </div>

        {/* Mobile menu button — shown when viewport is below 7xl (1280px) */}
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-brand-white hover:bg-white/10 xl:hidden"
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

      {/* Mobile nav — shown when viewport is below 7xl (1280px), animated open/close */}
      <div
        id="mobile-nav"
        className={`grid xl:hidden ${mobileMenuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        style={{ transition: "grid-template-rows 200ms ease-out" }}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="min-h-0 overflow-hidden">
          <nav
            className={`flex flex-col border-t border-white/10 bg-brand-black transition-all duration-200 ${
              mobileMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
            aria-label="Main"
          >
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="border-b border-white/10 last:border-0">
              {item.children.length === 0 ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center px-4 py-1.5 text-left text-sm font-[600] tracking-tight text-brand-white hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-1.5 text-left text-sm font-[600] tracking-tight text-brand-white hover:bg-white/5"
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
                  className={`bg-black/30 px-4 transition-all duration-200 overflow-hidden ${
                    openDropdown === item.label
                      ? "max-h-96 opacity-100 pb-2"
                      : "max-h-0 opacity-0 pb-0"
                  }`}
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      className="block py-0.5 pl-4 text-sm tracking-tight text-brand-white/90 hover:text-brand-tan"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
                  )}
                </>
              )}
            </div>
          ))}
          {/* Give and profile underneath nav items */}
          <div className="flex items-center justify-center gap-2 border-t border-white/10 px-4 py-3">
            <Link
              href="#"
              className="flex shrink-0 items-center justify-center rounded bg-brand-tan px-2 py-1 text-base font-semibold tracking-tight text-brand-black hover:bg-brand-tan/90"
            >
              Give
            </Link>
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded tracking-tight text-brand-white hover:text-brand-tan"
              aria-label="Account: log in, sign up, or log out"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </button>
          </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
