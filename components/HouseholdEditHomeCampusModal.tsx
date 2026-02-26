"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { CampusLocation } from "@/lib/households";

const ANIMATION_DURATION_MS = 200;

type Props = {
  open: boolean;
  selectedValue: string | null;
  options: CampusLocation[];
  onClose: () => void;
  onSave: (homeCampus: string | null) => void | Promise<void>;
  saving: boolean;
};

export default function HouseholdEditHomeCampusModal({
  open,
  selectedValue,
  options,
  onClose,
  onSave,
  saving,
}: Props) {
  const [value, setValue] = useState(selectedValue ?? "");
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) setValue(selectedValue ?? "");
  }, [open, selectedValue]);

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
      const next = value.trim() || null;
      await onSave(next);
      handleClose();
    },
    [value, onSave, handleClose]
  );

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
      aria-labelledby="edit-home-campus-title"
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
          <h3 id="edit-home-campus-title" className="text-xl font-bold tracking-tight text-brand-black">
            Edit home campus
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">
              Home campus
            </span>
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
              aria-label="Home campus"
            >
              <option value="">No campus selected</option>
              {options.map((opt) => (
                <option key={opt.location} value={opt.location}>
                  {opt.location}
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
