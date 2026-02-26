"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MEMBERSHIP_TYPE_LABELS } from "@/constants/household";
import type { HouseholdMembershipType } from "@/lib/households";

const ANIMATION_DURATION_MS = 200;

const ROLE_OPTIONS: HouseholdMembershipType[] = [
  "Head of Household",
  "Adult",
  "Child",
  "Other",
];

type Props = {
  open: boolean;
  memberName: string;
  currentType: HouseholdMembershipType;
  onSave: (newType: HouseholdMembershipType) => void | Promise<void>;
  onClose: () => void;
  saving: boolean;
};

export default function HouseholdEditMemberRoleModal({
  open,
  memberName,
  currentType,
  onSave,
  onClose,
  saving,
}: Props) {
  const [value, setValue] = useState<HouseholdMembershipType>(currentType);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) setValue(currentType);
  }, [open, currentType]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null;
      onClose();
      setIsClosing(false);
    }, ANIMATION_DURATION_MS);
  }, [onClose, isClosing]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await onSave(value);
      handleClose();
    },
    [value, onSave, handleClose]
  );

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !saving) handleClose();
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open, saving, handleClose]);

  if (!open && !isClosing) return null;

  const isExiting = isClosing;
  const overlayOpacity = isExiting ? "opacity-0" : "opacity-100";
  const contentOpacity = isExiting ? "opacity-0 scale-95" : "opacity-100 scale-100";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-opacity duration-200 ease-out ${isClosing ? "pointer-events-none" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-member-role-title"
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
          <h3 id="edit-member-role-title" className="text-xl font-bold tracking-tight text-brand-black">
            Edit household role
          </h3>
          <p className="mt-1 text-sm tracking-tight text-brand-black/80">
            Set household role for <strong className="font-bold text-brand-black">{memberName}</strong>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
              Role
            </span>
            <select
              value={value}
              onChange={(e) => setValue(e.target.value as HouseholdMembershipType)}
              className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm tracking-tight text-brand-black"
              aria-label="Role"
            >
              {ROLE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {MEMBERSHIP_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-brand-black px-4 py-2 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 hover:text-brand-tan disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="rounded border border-brand-black/30 px-4 py-2 text-sm font-medium tracking-tight text-brand-black hover:bg-brand-black/5 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
