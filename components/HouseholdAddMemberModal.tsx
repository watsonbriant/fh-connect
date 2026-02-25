"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MEMBERSHIP_TYPE_LABELS } from "@/constants/household";
import type { HouseholdMembershipType } from "@/lib/households";

const ANIMATION_DURATION_MS = 200;

type AddByEmailForm = {
  email: string;
  membership_type: HouseholdMembershipType;
};

export type AddNoAccountForm = {
  first_name: string;
  last_name: string;
  membership_type: "Child" | "Other";
  date_of_birth?: string;
  email?: string;
  phone_number?: string;
};

type Props = {
  open: boolean;
  mode: "email" | "no_account";
  onModeChange: (mode: "email" | "no_account") => void;
  onClose: () => void;
  addByEmailForm: AddByEmailForm;
  onAddByEmailFormChange: (updater: (prev: AddByEmailForm) => AddByEmailForm) => void;
  addNoAccountForm: AddNoAccountForm;
  onAddNoAccountFormChange: (updater: (prev: AddNoAccountForm) => AddNoAccountForm) => void;
  onAddByEmail: (e: React.FormEvent) => void;
  onAddNoAccount: (e: React.FormEvent) => void;
  saving: boolean;
};

export default function HouseholdAddMemberModal({
  open,
  mode,
  onModeChange,
  onClose,
  addByEmailForm,
  onAddByEmailFormChange,
  addNoAccountForm,
  onAddNoAccountFormChange,
  onAddByEmail,
  onAddNoAccount,
  saving,
}: Props) {
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null;
      onClose();
      setIsClosing(false);
    }, ANIMATION_DURATION_MS);
  }, [onClose, isClosing]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  if (!open && !isClosing) return null;

  const isExiting = isClosing;
  const overlayOpacity = isExiting ? "opacity-0" : "opacity-100";
  const contentOpacity = isExiting ? "opacity-0 scale-95" : "opacity-100 scale-100";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-opacity duration-200 ease-out ${isClosing ? "pointer-events-none" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-member-title"
    >
      <div
        className={`absolute inset-0 bg-brand-black/50 transition-opacity duration-200 ease-out ${overlayOpacity}`}
        onClick={handleClose}
        aria-hidden
      />
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-3xl border border-brand-black bg-brand-white shadow-lg text-brand-black transition-all duration-200 ease-out ${contentOpacity}`}
      >
        <div className="border-b border-brand-black/10 px-5 py-4">
          <h3 id="add-member-title" className="text-xl font-bold tracking-tight text-brand-black">
            Add member
          </h3>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onModeChange("email")}
              className={`rounded px-3 py-1.5 text-sm font-medium tracking-tight transition-colors ${
                mode === "email"
                  ? "bg-brand-black text-brand-white"
                  : "border border-brand-black/30 text-brand-black hover:bg-brand-black/5"
              }`}
            >
              Invite by email
            </button>
            <button
              type="button"
              onClick={() => onModeChange("no_account")}
              className={`rounded px-3 py-1.5 text-sm font-medium tracking-tight transition-colors ${
                mode === "no_account"
                  ? "bg-brand-black text-brand-white"
                  : "border border-brand-black/30 text-brand-black hover:bg-brand-black/5"
              }`}
            >
              Add without account
            </button>
          </div>
        </div>
        <div className="p-5">
          {mode === "email" ? (
            <form onSubmit={onAddByEmail} className="flex flex-col gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
                  Email
                </span>
                <input
                  type="email"
                  value={addByEmailForm.email}
                  onChange={(e) => onAddByEmailFormChange((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
                  Membership type
                </span>
                <select
                  value={addByEmailForm.membership_type}
                  onChange={(e) =>
                    onAddByEmailFormChange((f) => ({
                      ...f,
                      membership_type: e.target.value as HouseholdMembershipType,
                    }))
                  }
                  className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm tracking-tight text-brand-black"
                >
                  {(Object.keys(MEMBERSHIP_TYPE_LABELS) as HouseholdMembershipType[]).map((t) => (
                    <option key={t} value={t}>
                      {MEMBERSHIP_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-brand-black px-4 py-2 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 hover:text-brand-tan disabled:opacity-50"
                >
                  {saving ? "Sending…" : "Send invite"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded border border-brand-black/30 px-4 py-2 text-sm font-medium tracking-tight text-brand-black hover:bg-brand-black/5"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={onAddNoAccount} className="flex flex-col gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
                  First name
                </span>
                <input
                  type="text"
                  value={addNoAccountForm.first_name}
                  onChange={(e) => onAddNoAccountFormChange((f) => ({ ...f, first_name: e.target.value }))}
                  className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
                  Last name
                </span>
                <input
                  type="text"
                  value={addNoAccountForm.last_name}
                  onChange={(e) => onAddNoAccountFormChange((f) => ({ ...f, last_name: e.target.value }))}
                  className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
                  Membership type
                </span>
                <select
                  value={addNoAccountForm.membership_type}
                  onChange={(e) =>
                    onAddNoAccountFormChange((f) => ({
                      ...f,
                      membership_type: e.target.value as "Child" | "Other",
                    }))
                  }
                  className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm tracking-tight text-brand-black"
                >
                  <option value="Child">{MEMBERSHIP_TYPE_LABELS.Child}</option>
                  <option value="Other">{MEMBERSHIP_TYPE_LABELS.Other}</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
                  Date of birth
                </span>
                <input
                  type="date"
                  value={addNoAccountForm.date_of_birth ?? ""}
                  onChange={(e) =>
                    onAddNoAccountFormChange((f) => ({ ...f, date_of_birth: e.target.value || undefined }))
                  }
                  className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
                  Email (optional)
                </span>
                <input
                  type="email"
                  value={addNoAccountForm.email ?? ""}
                  onChange={(e) =>
                    onAddNoAccountFormChange((f) => ({ ...f, email: e.target.value || undefined }))
                  }
                  className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
                  Phone (optional)
                </span>
                <input
                  type="tel"
                  value={addNoAccountForm.phone_number ?? ""}
                  onChange={(e) =>
                    onAddNoAccountFormChange((f) => ({ ...f, phone_number: e.target.value || undefined }))
                  }
                  className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
                />
              </label>
              <div className="mt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-brand-black px-4 py-2 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 hover:text-brand-tan disabled:opacity-50"
                >
                  {saving ? "Adding…" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded border border-brand-black/30 px-4 py-2 text-sm font-medium tracking-tight text-brand-black hover:bg-brand-black/5"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
