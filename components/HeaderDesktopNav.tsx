"use client";

import Link from "next/link";
import { NAV_ITEMS } from "@/constants/nav";
import HeaderProfileButton from "@/components/HeaderProfileButton";

type Props = {
  openDropdown: string | null;
  onDropdownChange: (label: string | null) => void;
  accountMenuRef: React.RefObject<HTMLDivElement | null>;
  accountMenuOpen: boolean;
  onAccountMenuToggle: () => void;
  avatarUrl: string | null;
  profileInitials: string | null;
  hasUser: boolean;
  hasPendingInvites?: boolean;
  onCloseAccountMenu: () => void;
  onLogout: () => void;
  onOpenAuthModal: () => void;
};

export default function HeaderDesktopNav({
  openDropdown,
  onDropdownChange,
  accountMenuRef,
  accountMenuOpen,
  onAccountMenuToggle,
  avatarUrl,
  profileInitials,
  hasUser,
  hasPendingInvites = false,
  onCloseAccountMenu,
  onLogout,
  onOpenAuthModal,
}: Props) {
  return (
    <div className="hidden items-center gap-1 xl:flex">
      <nav className="flex items-center gap-1" aria-label="Main">
        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() =>
              item.children.length > 0 && onDropdownChange(item.label)
            }
            onMouseLeave={() => onDropdownChange(null)}
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
                  onClick={() =>
                    onDropdownChange(
                      openDropdown === item.label ? null : item.label
                    )
                  }
                >
                  {item.label}
                </button>
                {item.children.length > 0 && (
                  <div
                    className={`absolute left-0 top-full min-w-[180px] rounded border border-brand-black/20 bg-brand-white shadow-lg transition-all duration-200 ${
                      openDropdown === item.label
                        ? "translate-y-0 opacity-100 pointer-events-auto"
                        : "-translate-y-2 opacity-0 pointer-events-none"
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
        className="ml-4 flex items-center justify-center rounded bg-brand-tan px-2 py-1 text-sm font-semibold tracking-tight text-brand-black hover:bg-brand-tan/90"
      >
        Give
      </Link>
      <div className="relative ml-2" ref={accountMenuRef}>
        <HeaderProfileButton
          avatarUrl={avatarUrl}
          profileInitials={profileInitials}
          hasUser={!!hasUser}
          hasPendingInvites={hasPendingInvites}
          accountMenuOpen={accountMenuOpen}
          onToggle={onAccountMenuToggle}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded text-brand-white hover:text-brand-tan"
        />
        {accountMenuOpen && (
          <div
            className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded border border-brand-black/20 bg-brand-white py-1 shadow-lg"
            role="menu"
          >
            {hasUser ? (
              <>
                <Link
                  href="/fhconnect/account"
                  className="block px-4 py-2 text-left text-sm font-medium tracking-tight text-brand-black hover:bg-brand-tan/80"
                  role="menuitem"
                  onClick={onCloseAccountMenu}
                >
                  FHConnect
                </Link>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm font-medium tracking-tight text-brand-black hover:bg-brand-tan/80"
                  role="menuitem"
                  onClick={onLogout}
                >
                  Log out
                </button>
              </>
            ) : (
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm font-medium tracking-tight text-brand-black hover:bg-brand-tan/80"
                role="menuitem"
                onClick={onOpenAuthModal}
              >
                Log in
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
