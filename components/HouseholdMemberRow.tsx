"use client";

import { getAvatarUrl } from "@/lib/auth";
import { RELATIONSHIP_LABELS } from "@/constants/household";
import type { HouseholdMember, HouseholdMemberRole } from "@/lib/households";

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
  onRoleChange: (member: HouseholdMember, newRole: HouseholdMemberRole) => void;
  onRemove: (member: HouseholdMember) => void;
};

export default function HouseholdMemberRow({ member, isHead, onRoleChange, onRemove }: Props) {
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
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-tan/30 text-sm font-semibold text-brand-black">
            {(p?.first_name || "?").charAt(0)}
          </div>
        )}
        <div>
          <span className="font-medium tracking-tight text-brand-black">{displayName(member)}</span>
          {member.role === "head" && (
            <span className="ml-2 text-xs tracking-tight text-brand-black/60">Head</span>
          )}
          {member.relationship && (
            <span className="ml-2 text-xs tracking-tight text-brand-black/60">
              {RELATIONSHIP_LABELS[member.relationship]}
            </span>
          )}
          {member.has_account && (
            <span className="ml-2 text-xs tracking-tight text-brand-black/50">Has account</span>
          )}
        </div>
      </div>
      {isHead && (
        <div className="flex items-center gap-1">
          {member.role === "head" ? (
            <button
              type="button"
              onClick={() => onRoleChange(member, "member")}
              className="text-xs tracking-tight text-brand-black/70 underline transition-colors duration-150 hover:text-brand-black"
            >
              Demote to member
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onRoleChange(member, "head")}
              className="text-xs tracking-tight text-brand-black/70 underline transition-colors duration-150 hover:text-brand-black"
            >
              Make head
            </button>
          )}
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
