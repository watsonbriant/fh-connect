"use client";

import Link from "next/link";
import { NAV_ITEMS } from "@/constants/nav";
import HeaderProfileButton from "@/components/HeaderProfileButton";

type Props = {
  mobileMenuOpen: boolean;
  openDropdown: string | null;
  onDropdownChange: (label: string | null) => void;
  onCloseMobileMenu: () => void;
  accountMenuRefMobile: React.RefObject<HTMLDivElement | null>;
  accountMenuOpen: boolean;
  onAccountMenuToggle: () => void;
  avatarUrl: string | null;
  profileInitials: string | null;
  hasUser: boolean;
  hasPendingInvites?: boolean;
  onLogout: () => void;
  onOpenAuthModal: () => void;
  onCloseAllMenus: () => void;
};

export default function HeaderMobileNav({
  mobileMenuOpen,
  openDropdown,
  onDropdownChange,
  onCloseMobileMenu,
  accountMenuRefMobile,
  accountMenuOpen,
  onAccountMenuToggle,
  avatarUrl,
  profileInitials,
  hasUser,
  hasPendingInvites = false,
  onLogout,
  onOpenAuthModal,
  onCloseAllMenus,
}: Props) {
  return (
    <div
      id="mobile-nav"
      className={`grid xl:hidden ${mobileMenuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      style={{ transition: "grid-template-rows 200ms ease-out" }}
      aria-hidden={!mobileMenuOpen}
    >
      <div className="min-h-0 overflow-hidden">
        <nav
          className={`flex flex-col border-t border-white/10 bg-brand-black transition-all duration-200 ${
            mobileMenuOpen
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "-translate-y-2 opacity-0 pointer-events-none"
          }`}
          aria-label="Main"
        >
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className="border-b border-white/10 last:border-0"
            >
              {item.children.length === 0 ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center px-4 py-1.5 text-left text-sm font-[600] tracking-tight text-brand-white hover:bg-white/5"
                  onClick={onCloseMobileMenu}
                >
                  {item.label}
                </a>
              ) : (
                <>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-1.5 text-left text-sm font-[600] tracking-tight text-brand-white hover:bg-white/5"
                    onClick={() =>
                      onDropdownChange(
                        openDropdown === item.label ? null : item.label
                      )
                    }
                    aria-expanded={openDropdown === item.label}
                  >
                    {item.label}
                    <svg
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        openDropdown === item.label ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {item.children.length > 0 && (
                    <div
                      className={`overflow-hidden bg-black/30 px-4 transition-all duration-200 ${
                        openDropdown === item.label
                          ? "max-h-96 pb-2 opacity-100"
                          : "max-h-0 pb-0 opacity-0"
                      }`}
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block py-0.5 pl-4 text-sm tracking-tight text-brand-white/90 hover:text-brand-tan"
                          onClick={onCloseMobileMenu}
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
          <div
            ref={accountMenuRefMobile}
            className="flex flex-col items-center gap-2 border-t border-white/10 px-4 py-3"
          >
            <div className="flex items-center justify-center gap-2">
              <Link
                href="#"
                className="flex shrink-0 items-center justify-center rounded bg-brand-tan px-2 py-1 text-base font-semibold tracking-tight text-brand-black hover:bg-brand-tan/90"
              >
                Give
              </Link>
              <HeaderProfileButton
                avatarUrl={avatarUrl}
                profileInitials={profileInitials}
                hasUser={!!hasUser}
                hasPendingInvites={hasPendingInvites}
                accountMenuOpen={accountMenuOpen}
                onToggle={onAccountMenuToggle}
                className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded tracking-tight text-brand-white hover:text-brand-tan"
              />
            </div>
            {accountMenuOpen && (
              <div
                className="w-full rounded border border-white/20 bg-brand-black/90 py-1"
                role="menu"
              >
                {hasUser ? (
                  <>
                    <Link
                      href="/fhconnect/account"
                      className="block px-4 py-2 text-left text-sm font-medium tracking-tight text-brand-white hover:bg-white/10"
                      role="menuitem"
                      onClick={onCloseAllMenus}
                    >
                      FHConnect
                    </Link>
                    <button
                      type="button"
                      className="block w-full px-4 py-2 text-left text-sm font-medium tracking-tight text-brand-white hover:bg-white/10"
                      role="menuitem"
                      onClick={onLogout}
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="block w-full px-4 py-2 text-left text-sm font-medium tracking-tight text-brand-white hover:bg-white/10"
                    role="menuitem"
                    onClick={onOpenAuthModal}
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
  );
}
