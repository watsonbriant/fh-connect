"use client";

type Props = {
  avatarUrl: string | null;
  profileInitials: string | null;
  hasUser: boolean;
  hasPendingInvites?: boolean;
  accountMenuOpen: boolean;
  onToggle: () => void;
  className?: string;
};

export default function HeaderProfileButton({
  avatarUrl,
  profileInitials,
  hasUser,
  hasPendingInvites = false,
  accountMenuOpen,
  onToggle,
  className,
}: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group relative ${className ?? ""}`}
      aria-label={
        hasUser
          ? hasPendingInvites
            ? "Account and profile (you have household invitations)"
            : "Account and profile"
          : "Account: log in, sign up, or log out"
      }
      aria-expanded={accountMenuOpen}
      aria-haspopup="true"
    >
      {hasUser && (avatarUrl || profileInitials) ? (
        <>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-tan transition-colors hover:ring-brand-white"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-tan text-sm font-semibold tracking-tight text-brand-black ring-2 ring-brand-tan transition-colors hover:ring-brand-white">
              {profileInitials}
            </span>
          )}
          {hasPendingInvites && (
            <span
              className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-brand-tan ring-2 ring-brand-black"
              aria-hidden
            />
          )}
        </>
      ) : (
        <>
          <svg
            className="h-6 w-6 fill-none stroke-current text-brand-white transition-opacity group-hover:opacity-0"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <svg
            className="absolute inset-0 m-auto h-6 w-6 fill-current text-brand-tan opacity-0 transition-opacity group-hover:opacity-100"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </>
      )}
    </button>
  );
}
