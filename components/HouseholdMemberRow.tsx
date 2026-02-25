"use client";

import { getAvatarUrl } from "@/lib/auth";
import { MEMBERSHIP_TYPE_LABELS } from "@/constants/household";
import type { HouseholdMember, HouseholdMembershipType } from "@/lib/households";

type PersonLike = {
  first_name: string;
  last_name: string;
  preferred_name: string;
  email: string | null;
  avatar_path?: string | null;
};

function person(m: HouseholdMember): PersonLike | undefined {
  return m.person as PersonLike | undefined;
}

function displayName(m: HouseholdMember): string {
  const p = person(m);
  return p?.preferred_name || p?.first_name || "—";
}

type Props = {
  member: HouseholdMember;
  isHead: boolean;
  onMembershipTypeChange: (member: HouseholdMember, newType: HouseholdMembershipType) => void;
  onRemove: (member: HouseholdMember) => void;
};

export default function HouseholdMemberRow({
  member,
  isHead,
  onMembershipTypeChange,
  onRemove,
}: Props) {
  const avatarPath = (member.person as PersonLike)?.avatar_path ?? null;
  const avatarUrl = getAvatarUrl(avatarPath);
  const p = person(member);

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded border border-brand-black/10 px-3 py-2">
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-brand-black/10"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-tan/30 text-sm font-semibold tracking-tight text-brand-black">
            {(p?.first_name || "?").charAt(0)}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium tracking-tight text-brand-black">{displayName(member)}</span>
          <span className="inline-flex rounded-full bg-brand-black/10 px-2 py-0.5 text-xs font-medium tracking-tight text-brand-black">
            {MEMBERSHIP_TYPE_LABELS[member.household_membership_type]}
          </span>
          {member.has_account && (
            <span className="text-xs tracking-tight text-brand-black/50">Has account</span>
          )}
        </div>
      </div>
      {isHead && (
        <div className="flex flex-wrap items-center gap-1">
          <select
            value={member.household_membership_type}
            onChange={(e) =>
              onMembershipTypeChange(member, e.target.value as HouseholdMembershipType)
            }
            className="rounded border border-brand-black/20 px-2 py-1 text-xs tracking-tight text-brand-black"
            aria-label={`Change membership type for ${displayName(member)}`}
          >
            {(["Head of Household", "Child", "Other"] as const).map((t) => (
              <option key={t} value={t}>
                {MEMBERSHIP_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onRemove(member)}
            className="text-xs tracking-tight text-red-600 underline transition-colors duration-150 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      )}
    </li>
  );
}
