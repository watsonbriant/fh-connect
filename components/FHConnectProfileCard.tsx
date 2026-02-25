"use client";

import type { Profile } from "@/lib/auth";
import { SECTION_HEADERS } from "@/constants/fhconnectSections";
import type { Section } from "@/constants/fhconnectSections";

type Props = {
  section: Section;
  profile: Profile | null;
  firstName: string;
  lastName: string;
  nameEditing: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onNameEditingChange: (editing: boolean) => void;
  displayUrl: string | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
};

export default function FHConnectProfileCard({
  section,
  profile,
  firstName,
  lastName,
  nameEditing,
  onFirstNameChange,
  onLastNameChange,
  onNameEditingChange,
  displayUrl,
  onAvatarChange,
  onSubmit,
  saving,
}: Props) {
  return (
    <div className="min-w-0 overflow-hidden rounded-3xl border border-brand-black bg-brand-white px-5 py-6 text-brand-black shadow-lg">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight text-brand-black">
          {SECTION_HEADERS[section]}
        </h2>
        <form onSubmit={onSubmit} className="flex shrink-0">
          {nameEditing ? (
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-brand-black px-3 py-1 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 hover:text-brand-tan disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setTimeout(() => onNameEditingChange(true), 0)}
              className="rounded bg-brand-black px-3 py-1 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 hover:text-brand-tan"
            >
              Edit name
            </button>
          )}
        </form>
      </div>
      <form onSubmit={onSubmit}>
        <div className="flex flex-row items-start gap-4">
          <div className="group relative shrink-0 transition-transform duration-200 ease-out hover:scale-105">
            {displayUrl ? (
              <img
                src={displayUrl}
                alt="Profile"
                className="h-[116px] w-[116px] rounded-full object-cover ring-2 ring-brand-tan transition-[box-shadow] duration-200 ease-out group-hover:ring-4"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-tan/30 text-2xl font-semibold text-brand-black ring-2 ring-brand-tan transition-[box-shadow] duration-200 ease-out group-hover:ring-4">
                {profile
                  ? `${(profile.first_name || "").charAt(0)}${(profile.last_name || "").charAt(0)}`
                  : "?"}
              </div>
            )}
            <div
              className="pointer-events-none absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
              aria-hidden
            />
            <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-brand-black text-brand-white shadow">
              <span
                className="pointer-events-none absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
                aria-hidden
              />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={onAvatarChange}
              />
              <svg className="relative h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
              </svg>
            </label>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
                First name
              </span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                readOnly={!nameEditing}
                className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight read-only:border-brand-black/10 read-only:bg-brand-black/5"
                autoComplete="given-name"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
                Last name
              </span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                readOnly={!nameEditing}
                className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight read-only:border-brand-black/10 read-only:bg-brand-black/5"
                autoComplete="family-name"
              />
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
