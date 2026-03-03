"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import supabase from "@/lib/supabase";
import { getProfile, getAvatarUrl, type Profile } from "@/lib/auth";
import { getPendingInviteCount } from "@/lib/households";
import { useLogoutToast } from "@/contexts/LogoutToastContext";
import AuthModal from "@/components/AuthModal";
import HeaderDesktopNav from "@/components/HeaderDesktopNav";
import HeaderMobileNav from "@/components/HeaderMobileNav";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { showLogoutToast, clearEmailConfirmedFlag } = useLogoutToast();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pendingInviteCount, setPendingInviteCount] = useState(0);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRefMobile = useRef<HTMLDivElement>(null);
  const lastSignedInAtRef = useRef<number>(0);

  const refreshAuth = useCallback(async () => {
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    setUser(u ? { id: u.id, email: u.email ?? undefined } : null);
    if (u) {
      const p = await getProfile(u.id);
      setProfile(p);
      if (p?.person_id) {
        getPendingInviteCount(p.person_id).then(setPendingInviteCount);
      } else {
        setPendingInviteCount(0);
      }
    } else {
      setProfile(null);
      setPendingInviteCount(0);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
    const IGNORE_SIGNED_OUT_MS = 5000;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        lastSignedInAtRef.current = Date.now();
      }
      if (event === "SIGNED_OUT" && Date.now() - lastSignedInAtRef.current < IGNORE_SIGNED_OUT_MS) {
        return;
      }
      refreshAuth();
    });
    return () => subscription.unsubscribe();
  }, [refreshAuth]);

  useEffect(() => {
    const onInvitationsChanged = () => {
      if (profile?.person_id) {
        getPendingInviteCount(profile.person_id).then(setPendingInviteCount);
      }
    };
    window.addEventListener("household-invitations-changed", onInvitationsChanged);
    return () => window.removeEventListener("household-invitations-changed", onInvitationsChanged);
  }, [profile?.person_id]);

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

  const handleLogout = useCallback(() => {
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
    const wasOnFhconnect = pathname?.startsWith("/fhconnect");
    setUser(null);
    setProfile(null);
    clearEmailConfirmedFlag();
    showLogoutToast();
    if (wasOnFhconnect) {
      setTimeout(() => router.replace("/home"), 1000);
    }
    const LOGOUT_TIMEOUT_MS = 10000;
    const signOutWithTimeout = Promise.race([
      supabase.auth.signOut(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Logout timed out")), LOGOUT_TIMEOUT_MS)
      ),
    ]);
    signOutWithTimeout.then(refreshAuth).catch(refreshAuth);
  }, [refreshAuth, pathname, showLogoutToast, clearEmailConfirmedFlag, router]);

  const avatarUrl = profile?.avatar_path
    ? getAvatarUrl(profile.avatar_path, profile.updated_at)
    : null;
  const profileInitials = profile
    ? `${(profile.first_name || "").charAt(0)}${(profile.last_name || "").charAt(0)}`.toUpperCase() ||
      "?"
    : null;

  return (
    <header
      className="sticky top-0 z-50 w-full tracking-tight text-brand-white shadow-[0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-none"
      style={{ backgroundColor: "#000000", isolation: "isolate" }}
    >
      <div className="relative mx-auto flex h-14 min-h-[44px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex h-full shrink-0 py-3"
          aria-label="Freedom House home"
        >
          <img
            src="/logo-white.png"
            alt="Freedom House"
            className="h-full w-auto object-contain transition-transform duration-200 hover:scale-105"
          />
        </Link>

        <HeaderDesktopNav
          openDropdown={openDropdown}
          onDropdownChange={setOpenDropdown}
          accountMenuRef={accountMenuRef}
          accountMenuOpen={accountMenuOpen}
          onAccountMenuToggle={() => setAccountMenuOpen((open) => !open)}
          avatarUrl={avatarUrl}
          profileInitials={profileInitials}
          hasUser={!!user}
          hasPendingInvites={pendingInviteCount > 0}
          onCloseAccountMenu={() => setAccountMenuOpen(false)}
          onLogout={handleLogout}
          onOpenAuthModal={openAccountModal}
        />

        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-brand-white hover:bg-white/10 xl:hidden"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">
            {mobileMenuOpen ? "Close menu" : "Open menu"}
          </span>
          {mobileMenuOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      <HeaderMobileNav
        mobileMenuOpen={mobileMenuOpen}
        openDropdown={openDropdown}
        onDropdownChange={setOpenDropdown}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        accountMenuRefMobile={accountMenuRefMobile}
        accountMenuOpen={accountMenuOpen}
        onAccountMenuToggle={() => setAccountMenuOpen((open) => !open)}
        avatarUrl={avatarUrl}
        profileInitials={profileInitials}
        hasUser={!!user}
        hasPendingInvites={pendingInviteCount > 0}
        onLogout={handleLogout}
        onOpenAuthModal={openAccountModal}
        onCloseAllMenus={() => {
          setAccountMenuOpen(false);
          setMobileMenuOpen(false);
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthChange={refreshAuth}
      />
    </header>
  );
}
