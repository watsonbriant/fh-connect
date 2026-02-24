"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import supabase from "@/lib/supabase";
import { getProfile, getAvatarUrl, type Profile } from "@/lib/auth";
import AuthModal from "@/components/AuthModal";

const NAV_ITEMS: { label: string; href: string; children: { label: string; href: string }[] }[] = [
  { label: "Join Us.", href: "#", children: [] },
  { label: "Who We Are.", href: "#", children: [{ label: "Sit With Me", href: "#" }, { label: "Vision + Beliefs", href: "#" }, { label: "Our Campuses", href: "#" }, { label: "Our Pastors", href: "#" }, { label: "Job Openings", href: "#" }, { label: "Download the FH App", href: "#" }] },
  { label: "Get Connected.", href: "#", children: [{ label: "Connect With Us", href: "#" }, { label: "Upcoming Events", href: "#" }, { label: "Join a LifeGroup", href: "#" }, { label: "FHKids", href: "#" }, { label: "Vertical Youth", href: "#" }, { label: "MVMNT Young Adults", href: "#" }, { label: "Strong Men", href: "#" }, { label: "Authentic Women", href: "#" }, { label: "FHConnect", href: "/fhconnect" }] },
  { label: "Your Next Steps.", href: "#", children: [{ label: "Join The FH Family", href: "#" }, { label: "Serve in the Church", href: "#" }, { label: "Serve Charlotte", href: "#" }, { label: "Serve Around the World", href: "#" }, { label: "Get Baptized", href: "#" }, { label: "Move Forward", href: "#" }, { label: "Internship", href: "#" }, { label: "TPUSA Faith", href: "#" }] },
  { label: "Watch + Listen.", href: "#", children: [{ label: "Watch Live Online", href: "#" }, { label: "Previous Messages", href: "#" }, { label: "Worship", href: "#" }, { label: "YouTube", href: "#" }, { label: "Podcast", href: "#" }] },
  { label: "Get Support.", href: "#", children: [{ label: "Need Prayer?", href: "#" }, { label: "Need a Pastor?", href: "#" }, { label: "Recommended Counselors", href: "#" }, { label: "Religious Exemption Letter", href: "#" }] },
  { label: "Freedom Academy", href: "https://freedomacademync.cc", children: [] },
];

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRefMobile = useRef<HTMLDivElement>(null);

  const refreshAuth = useCallback(async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u ? { id: u.id, email: u.email ?? undefined } : null);
    if (u) {
      const p = await getProfile(u.id);
      setProfile(p);
    } else {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshAuth();
    });
    return () => subscription.unsubscribe();
  }, [refreshAuth]);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const inDesktop = accountMenuRef.current?.contains(target);
      const inMobile = accountMenuRefMobile.current?.contains(target);
      if (!inDesktop && !inMobile) setAccountMenuOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAccountMenuOpen(false);
    };
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountMenuOpen]);

  const openAccountModal = () => {
    setAuthModalOpen(true);
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const closeAccountMenu = () => setAccountMenuOpen(false);

  const avatarUrl = profile?.avatar_path ? getAvatarUrl(profile.avatar_path, profile.updated_at) : null;
  const profileInitials = profile
    ? `${(profile.first_name || "").charAt(0)}${(profile.last_name || "").charAt(0)}`.toUpperCase() || "?"
    : null;

  const ProfileButton = ({ className }: { className?: string }) => (
    <button
      type="button"
      onClick={() => setAccountMenuOpen((open) => !open)}
      className={`group ${className ?? ""}`}
      aria-label={user ? "Account and profile" : "Account: log in, sign up, or log out"}
      aria-expanded={accountMenuOpen}
      aria-haspopup="true"
    >
      {user && (avatarUrl || profileInitials) ? (
        avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile"
            className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-tan transition-colors hover:ring-brand-white"
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-tan text-sm font-semibold tracking-tight text-brand-black ring-2 ring-brand-tan transition-colors hover:ring-brand-white">
            {profileInitials}
          </span>
        )
      ) : (
        <>
          {/* Same path for both: outline (default) and filled (hover) so the shape matches */}
          <svg className="h-6 w-6 fill-none stroke-current text-brand-white transition-opacity group-hover:opacity-0" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <svg className="absolute inset-0 m-auto h-6 w-6 fill-current text-brand-tan opacity-0 transition-opacity group-hover:opacity-100" viewBox="0 0 24 24" aria-hidden>
            <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </>
      )}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 w-full tracking-tight text-brand-white shadow-[0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-none" style={{ backgroundColor: '#000000', isolation: 'isolate' }}>
      <div className="relative mx-auto flex h-14 min-h-[44px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo: left-aligned on mobile and desktop */}
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
          <div className="relative" ref={accountMenuRef}>
            <ProfileButton className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded text-brand-white hover:text-brand-tan ml-2" />
            {accountMenuOpen && (
              <div
                className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded border border-brand-black/20 bg-brand-white py-1 shadow-lg"
                role="menu"
              >
                {user ? (
                  <>
                    <Link
                      href="/fhconnect"
                      className="block px-4 py-2 text-left text-sm font-medium tracking-tight text-brand-black hover:bg-brand-tan/80"
                      role="menuitem"
                      onClick={closeAccountMenu}
                    >
                      FHConnect
                    </Link>
                    <button
                      type="button"
                      className="block w-full px-4 py-2 text-left text-sm font-medium tracking-tight text-brand-black hover:bg-brand-tan/80"
                      role="menuitem"
                      onClick={async () => {
                        await supabase.auth.signOut();
                        refreshAuth();
                        closeAccountMenu();
                      }}
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="block w-full px-4 py-2 text-left text-sm font-medium tracking-tight text-brand-black hover:bg-brand-tan/80"
                    role="menuitem"
                    onClick={openAccountModal}
                  >
                    Log in
                  </button>
                )}
              </div>
            )}
          </div>
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
          <div ref={accountMenuRefMobile} className="flex flex-col items-center gap-2 border-t border-white/10 px-4 py-3">
            <div className="flex items-center justify-center gap-2">
            <Link
              href="#"
              className="flex shrink-0 items-center justify-center rounded bg-brand-tan px-2 py-1 text-base font-semibold tracking-tight text-brand-black hover:bg-brand-tan/90"
            >
              Give
            </Link>
            <button
              type="button"
              onClick={() => setAccountMenuOpen((open) => !open)}
              className="group flex h-11 w-11 shrink-0 items-center justify-center rounded tracking-tight text-brand-white hover:text-brand-tan relative"
              aria-label={user ? "Account and profile" : "Account: log in, sign up, or log out"}
              aria-expanded={accountMenuOpen}
            >
              {user && (avatarUrl || profileInitials) ? (
                avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-tan transition-colors hover:ring-brand-white"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-tan text-sm font-semibold tracking-tight text-brand-black ring-2 ring-brand-tan transition-colors hover:ring-brand-white">
                    {profileInitials}
                  </span>
                )
              ) : (
                <>
                  <svg className="h-6 w-6 fill-none stroke-current text-brand-white transition-opacity group-hover:opacity-0" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <svg className="absolute inset-0 m-auto h-6 w-6 fill-current text-brand-tan opacity-0 transition-opacity group-hover:opacity-100" viewBox="0 0 24 24" aria-hidden>
                    <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </>
              )}
            </button>
            </div>
            {accountMenuOpen && (
              <div className="w-full rounded border border-white/20 bg-brand-black/90 py-1" role="menu">
                {user ? (
                  <>
                    <Link
                      href="/fhconnect"
                      className="block px-4 py-2 text-left text-sm font-medium tracking-tight text-brand-white hover:bg-white/10"
                      role="menuitem"
                      onClick={() => { setAccountMenuOpen(false); setMobileMenuOpen(false); }}
                    >
                      FHConnect
                    </Link>
                    <button
                      type="button"
                      className="block w-full px-4 py-2 text-left text-sm font-medium tracking-tight text-brand-white hover:bg-white/10"
                      role="menuitem"
                      onClick={async () => {
                        await supabase.auth.signOut();
                        refreshAuth();
                        setAccountMenuOpen(false);
                        setMobileMenuOpen(false);
                      }}
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="block w-full px-4 py-2 text-left text-sm font-medium tracking-tight text-brand-white hover:bg-white/10"
                    role="menuitem"
                    onClick={openAccountModal}
                  >
                    Log in
                  </button>
                )}
              </div>
            )}
          </div>
          </nav>
        </div>
      </div>
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthChange={refreshAuth}
      />
    </header>
  );
}
