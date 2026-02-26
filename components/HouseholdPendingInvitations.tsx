"use client";

import type { HouseholdInvitation } from "@/lib/households";

type Props = {
  invitations: HouseholdInvitation[];
  saving: boolean;
  onAccept: (invitationId: string) => void;
  onDecline: (invitationId: string) => void;
};

function inviterDisplayName(inv: HouseholdInvitation): string {
  const first = (inv.inviter?.first_name ?? "").trim();
  const last = (inv.inviter?.last_name ?? "").trim();
  const full = [first, last].filter(Boolean).join(" ").trim();
  return full || inv.inviter?.preferred_name || "Someone";
}

export default function HouseholdPendingInvitations({
  invitations,
  saving,
  onAccept,
  onDecline,
}: Props) {
  if (invitations.length === 0) return null;

  return (
    <div className="mb-4 space-y-2">
      <p className="mb-1 text-xs font-bold uppercase tracking-tight text-brand-black/60">
        Pending invitations
      </p>
      {invitations.map((inv) => (
        <div
          key={inv.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded border border-brand-tan/50 bg-brand-tan/40 px-3 py-2 transition-all duration-200"
        >
          <p className="text-sm tracking-tight text-brand-black">
            <strong>{inviterDisplayName(inv)}</strong> has invited you to their household.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onAccept(inv.id)}
              disabled={saving}
              className="rounded bg-brand-black px-3 py-1.5 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 hover:text-brand-tan disabled:opacity-50"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => onDecline(inv.id)}
              disabled={saving}
              className="rounded border border-brand-black/30 px-3 py-1.5 text-sm font-medium tracking-tight text-brand-black hover:bg-brand-black/5 disabled:opacity-50"
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
