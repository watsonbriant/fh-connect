"use client";

import { Pencil, X } from "lucide-react";
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
  if (!p) return "—";
  const first = (p.first_name ?? "").trim();
  const last = (p.last_name ?? "").trim();
  return [first, last].filter(Boolean).join(" ") || "—";
}

type Props = {
  member: HouseholdMember;
  isHead: boolean;
  onEditRole: (member: HouseholdMember) => void;
  onRemove: (member: HouseholdMember) => void;
};

export default function HouseholdMemberRow({
  member,
  isHead,
  onEditRole,
  onRemove,
}: Props) {
  const avatarPath = (member.person as PersonLike)?.avatar_path ?? null;
  const avatarUrl = getAvatarUrl(avatarPath);
  const p = person(member);

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded border border-brand-black/20 px-2 py-1.5">
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-brand-black/10"
          />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-tan/60 text-sm font-semibold uppercase tracking-tight text-brand-black">
            {((p?.first_name || "?").charAt(0) + (p?.last_name || "").charAt(0)).trim() || "?"}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-brand-black">{displayName(member)}</span>
          <span className="inline-flex rounded-full bg-brand-black/20 px-2 py-0.5 text-[0.625rem] font-bold tracking-tight text-brand-black">
            {MEMBERSHIP_TYPE_LABELS[member.household_membership_type]}
          </span>
        </div>
      </div>
      {isHead && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onEditRole(member)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-brand-black/20 text-brand-black transition-colors duration-150 hover:bg-brand-black/5 hover:border-brand-black/40"
            aria-label={`Edit role for ${displayName(member)}`}
          >
            <Pencil className="h-3 w-3" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onRemove(member)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-red-600/30 text-red-600 transition-colors duration-150 hover:bg-red-50 hover:border-red-600/50"
            aria-label={`Remove ${displayName(member)} from household`}
          >
            <X className="h-3 w-3" aria-hidden />
          </button>
        </div>
      )}
    </li>
  );
}
