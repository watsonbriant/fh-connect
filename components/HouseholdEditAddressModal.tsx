"use client";

import { useState, useCallback, useRef, useEffect } from "react";

const ANIMATION_DURATION_MS = 200;

export type HouseholdAddressFormState = {
  street_address: string;
  city: string;
  state: string;
  zip: string;
};

type Props = {
  open: boolean;
  form: HouseholdAddressFormState;
  onFormChange: (updater: (prev: HouseholdAddressFormState) => HouseholdAddressFormState) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
};

export default function HouseholdEditAddressModal({
  open,
  form,
  onFormChange,
  onClose,
  onSubmit,
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
      aria-labelledby="edit-address-title"
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
          <h3 id="edit-address-title" className="text-xl font-bold tracking-tight text-brand-black">
            Edit address
          </h3>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-3 p-5">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
              Street address
            </span>
            <input
              type="text"
              value={form.street_address}
              onChange={(e) => onFormChange((f) => ({ ...f, street_address: e.target.value }))}
              className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
                City
              </span>
              <input
                type="text"
                value={form.city}
                onChange={(e) => onFormChange((f) => ({ ...f, city: e.target.value }))}
                className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
                State
              </span>
              <input
                type="text"
                value={form.state}
                onChange={(e) => onFormChange((f) => ({ ...f, state: e.target.value }))}
                className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
              ZIP
            </span>
            <input
              type="text"
              value={form.zip}
              onChange={(e) => onFormChange((f) => ({ ...f, zip: e.target.value }))}
              className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
            />
          </label>
          <div className="mt-2 flex gap-2">
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
              className="rounded border border-brand-black/30 px-4 py-2 text-sm font-medium tracking-tight text-brand-black hover:bg-brand-black/5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
