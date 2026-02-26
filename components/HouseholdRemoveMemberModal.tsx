"use client";

import { useState, useCallback, useRef, useEffect } from "react";

const ANIMATION_DURATION_MS = 200;

type Props = {
  open: boolean;
  memberName: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  removing: boolean;
};

export default function HouseholdRemoveMemberModal({
  open,
  memberName,
  onConfirm,
  onClose,
  removing,
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

  const handleConfirm = useCallback(async () => {
    await onConfirm();
    handleClose();
  }, [onConfirm, handleClose]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !removing) handleClose();
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open, removing, handleClose]);

  if (!open && !isClosing) return null;

  const isExiting = isClosing;
  const overlayOpacity = isExiting ? "opacity-0" : "opacity-100";
  const contentOpacity = isExiting ? "opacity-0 scale-95" : "opacity-100 scale-100";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-opacity duration-200 ease-out ${isClosing ? "pointer-events-none" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-member-title"
      aria-describedby="remove-member-description"
    >
      <div
        className={`absolute inset-0 bg-brand-black/50 transition-opacity duration-200 ease-out ${overlayOpacity}`}
        onClick={handleClose}
        aria-hidden
      />
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-3xl border border-brand-black bg-brand-white shadow-lg text-brand-black transition-all duration-200 ease-out ${contentOpacity}`}
      >
        <div className="px-5 py-4">
          <h2 id="remove-member-title" className="text-xl font-bold tracking-tight text-brand-black">
            Remove household member
          </h2>
          <p id="remove-member-description" className="mt-2 text-sm tracking-tight text-brand-black/80">
            Remove <strong className="font-bold text-brand-black">{memberName}</strong> from this household?
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={removing}
              className="rounded bg-brand-black px-4 py-2 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 hover:text-brand-tan disabled:opacity-50"
            >
              {removing ? "Removing…" : "Remove"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={removing}
              className="rounded border border-brand-black/30 px-4 py-2 text-sm font-medium tracking-tight text-brand-black hover:bg-brand-black/5 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
