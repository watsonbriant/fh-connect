"use client";

import type { Profile, Person, PersonUpdates } from "@/lib/auth";
import { getAge } from "@/lib/auth";
import { SECTION_HEADERS } from "@/constants/fhconnectSections";
import type { Section } from "@/constants/fhconnectSections";

export type ProfileFormState = PersonUpdates & {};

const inputClass =
  "w-full font-bold rounded border border-brand-black/20 bg-brand-white px-3 py-1 text-xs text-brand-black tracking-tight read-only:border-brand-black/10 read-only:bg-brand-black/5 disabled:border-brand-black/10 disabled:bg-brand-black/5 disabled:cursor-not-allowed";
const inputClassEditing =
  "!border-brand-tan";
const labelClass = "mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60";
function fullNameFromForm(form: ProfileFormState, profile: Profile | null): string {
  const prefix = (form.prefix ?? "").trim();
  const first = (form.first_name ?? "").trim() || (profile?.first_name ?? "").trim();
  const middle = (form.middle_name ?? "").trim();
  const last = (form.last_name ?? "").trim() || (profile?.last_name ?? "").trim();
  const suffix = (form.suffix ?? "").trim();
  return [prefix, first, middle, last, suffix].filter(Boolean).join(" ");
}

function displayInitials(person: Person | null, profile: Profile | null): string {
  if (person?.first_name || person?.last_name)
    return `${(person.first_name ?? "").charAt(0)}${(person.last_name ?? "").charAt(0)}`.trim() || "?";
  if (profile)
    return `${(profile.first_name || "").charAt(0)}${(profile.last_name || "").charAt(0)}`.trim() || "?";
  return "?";
}

const GENDER_OPTIONS = ["Male", "Female"] as const;
const MARITAL_STATUS_OPTIONS = ["Single", "Married", "Divorced", "Widowed"] as const;

type Props = {
  section: Section;
  profile: Profile | null;
  person: Person | null;
  form: ProfileFormState;
  onFormChange: (updater: (prev: ProfileFormState) => ProfileFormState) => void;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  displayUrl: string | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  /** Email shown from profile (not editable). */
  emailDisplay: string;
};

export default function FHConnectProfileCard({
  section,
  profile,
  person,
  form,
  onFormChange,
  editing,
  onEditingChange,
  displayUrl,
  onAvatarChange,
  onSubmit,
  saving,
  emailDisplay,
}: Props) {
  const age = getAge(person?.date_of_birth ?? form.date_of_birth ?? null);
  const fullName = fullNameFromForm(form, profile);
  const fieldClass = (readOnly: boolean) =>
    [inputClass, editing && !readOnly ? inputClassEditing : ""].filter(Boolean).join(" ");

  return (
    <div className="min-w-0 overflow-hidden rounded-3xl border border-brand-black bg-brand-white px-5 py-6 text-brand-black shadow-lg">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight text-brand-black">
          {SECTION_HEADERS[section]}
        </h2>
        <form onSubmit={onSubmit} className="flex shrink-0">
          {editing ? (
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
              onClick={() => setTimeout(() => onEditingChange(true), 0)}
              className="rounded bg-brand-black px-3 py-1 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 hover:text-brand-tan"
            >
              Edit profile
            </button>
          )}
        </form>
      </div>
      <form onSubmit={onSubmit}>
        {/* Block 1: profile picture + name only */}
        <div className="flex flex-row items-start gap-4">
          <div className="group relative shrink-0 transition-transform duration-200 ease-out hover:scale-105">
            {displayUrl ? (
              <img
                src={displayUrl}
                alt="Profile"
                className="h-[105px] w-[105px] rounded-full object-cover ring-2 ring-brand-tan transition-[box-shadow] duration-200 ease-out group-hover:ring-4"
              />
            ) : (
              <div className="flex h-[116px] w-[116px] items-center justify-center rounded-full bg-brand-tan/30 text-2xl font-semibold text-brand-black ring-2 ring-brand-tan transition-[box-shadow] duration-200 ease-out group-hover:ring-4">
                {displayInitials(person, profile)}
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

          <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-2">
            {editing ? (
              <>
                <label className="block">
                  <span className={labelClass}>Prefix</span>
                  <input
                    type="text"
                    value={form.prefix ?? ""}
                    onChange={(e) => onFormChange((p) => ({ ...p, prefix: e.target.value || null }))}
                    className={fieldClass(false)}
                    autoComplete="honorific-prefix"
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>First name</span>
                  <input
                    type="text"
                    value={form.first_name ?? ""}
                    onChange={(e) => onFormChange((p) => ({ ...p, first_name: e.target.value || null }))}
                    className={fieldClass(false)}
                    autoComplete="given-name"
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Middle name</span>
                  <input
                    type="text"
                    value={form.middle_name ?? ""}
                    onChange={(e) => onFormChange((p) => ({ ...p, middle_name: e.target.value || null }))}
                    className={fieldClass(false)}
                    autoComplete="additional-name"
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Last name</span>
                  <input
                    type="text"
                    value={form.last_name ?? ""}
                    onChange={(e) => onFormChange((p) => ({ ...p, last_name: e.target.value || null }))}
                    className={fieldClass(false)}
                    autoComplete="family-name"
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Suffix</span>
                  <input
                    type="text"
                    value={form.suffix ?? ""}
                    onChange={(e) => onFormChange((p) => ({ ...p, suffix: e.target.value || null }))}
                    className={fieldClass(false)}
                    autoComplete="honorific-suffix"
                  />
                </label>
              </>
            ) : (
              <label className="block lg:col-span-2">
                <span className={labelClass}>Name</span>
                <input
                  type="text"
                  value={fullName}
                  readOnly
                  className={fieldClass(true)}
                  aria-readonly="true"
                />
              </label>
            )}
            <label className="block">
              <span className={labelClass}>Preferred name</span>
              <input
                type="text"
                value={form.preferred_name ?? ""}
                onChange={(e) => onFormChange((p) => ({ ...p, preferred_name: e.target.value || null }))}
                readOnly={!editing}
                className={fieldClass(!editing)}
              />
            </label>
          </div>
        </div>

        {/* Block 2: full-width — contact + personal (dividing line through marital status) */}
        <div className="mt-3 border-t border-brand-black/20 pt-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Email</span>
              <input
                type="text"
                value={emailDisplay || ""}
                readOnly
                className={fieldClass(true)}
                aria-readonly="true"
              />
            </label>
            <label className="block">
              <span className={labelClass}>Phone number</span>
              <input
                type="tel"
                value={form.phone_number ?? ""}
                onChange={(e) => onFormChange((p) => ({ ...p, phone_number: e.target.value || null }))}
                readOnly={!editing}
                className={fieldClass(!editing)}
                autoComplete="tel"
              />
            </label>
            <label className="block">
              <span className={labelClass}>Date of birth</span>
              <input
                type="date"
                value={form.date_of_birth ?? ""}
                onChange={(e) => onFormChange((p) => ({ ...p, date_of_birth: e.target.value || null }))}
                readOnly={!editing}
                className={fieldClass(!editing)}
              />
            </label>
            {age !== null && (
              <label className="block">
                <span className={labelClass}>Age</span>
                <input
                  type="text"
                  value={String(age)}
                  readOnly
                  className={fieldClass(true)}
                  aria-readonly="true"
                />
              </label>
            )}
            <label className="block">
              <span className={labelClass}>Gender</span>
              <select
                value={
                  GENDER_OPTIONS.find((o) => o.toLowerCase() === (form.gender ?? "").toLowerCase()) ?? ""
                }
                onChange={(e) =>
                  onFormChange((p) => ({ ...p, gender: e.target.value || null }))
                }
                disabled={!editing}
                className={fieldClass(!editing)}
                aria-label="Gender"
              >
                <option value="">Select</option>
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Marital status</span>
              <select
                value={
                  MARITAL_STATUS_OPTIONS.find(
                    (o) => o.toLowerCase() === (form.marital_status ?? "").toLowerCase()
                  ) ?? ""
                }
                onChange={(e) =>
                  onFormChange((p) => ({ ...p, marital_status: e.target.value || null }))
                }
                disabled={!editing}
                className={fieldClass(!editing)}
                aria-label="Marital status"
              >
                <option value="">Select</option>
                {MARITAL_STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
