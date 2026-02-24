"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { flushSync } from "react-dom";
import supabase from "@/lib/supabase";

const ANIMATION_DURATION_MS = 200;

type ChangePasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
};

export default function ChangePasswordModal({
  isOpen,
  onClose,
  userEmail,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetForm = useCallback(() => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage(null);
    setSuccess(false);
  }, []);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    resetForm();
    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null;
      onClose();
      setIsClosing(false);
    }, ANIMATION_DURATION_MS);
  }, [onClose, resetForm, isClosing]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSuccess(false);
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });
      if (signInError) {
        setMessage({ type: "error", text: signInError.message });
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        setMessage({ type: "error", text: updateError.message });
        return;
      }
      requestAnimationFrame(() => {
        flushSync(() => {
          setLoading(false);
          setSuccess(true);
          setMessage({ type: "success", text: "Password updated." });
        });
        setTimeout(handleClose, 2000);
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !isClosing) return null;

  const isExiting = isClosing;
  const overlayOpacity = isExiting ? "opacity-0" : "opacity-100";
  const contentOpacity = isExiting ? "opacity-0 scale-95" : "opacity-100 scale-100";

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${isClosing ? "pointer-events-none" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-modal-title"
    >
      <div
        className={`absolute inset-0 bg-brand-black/80 backdrop-blur-sm transition-opacity duration-200 ease-out ${overlayOpacity}`}
        onClick={handleClose}
        aria-hidden
      />
      <div
        className={`relative w-full max-w-md rounded-lg border border-brand-black/20 bg-brand-white shadow-xl tracking-tight text-brand-black transition-all duration-200 ease-out ${contentOpacity}`}
      >
        <div className="flex items-center justify-between border-b border-brand-black/10 bg-brand-tan px-4 py-3 rounded-t-lg">
          <h2 id="change-password-modal-title" className="text-lg font-semibold tracking-tight text-brand-black">
            Change password
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded p-1 text-brand-black/70 hover:bg-brand-black/10 hover:text-brand-black"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 gap-4" aria-live="polite">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600" aria-hidden>
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <p className="text-lg font-medium tracking-tight text-brand-black">Password updated.</p>
            </div>
          ) : (
            <>
          {message && (
            <p
              className={`mb-4 rounded px-3 py-2 text-sm tracking-tight ${
                message.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
              }`}
            >
              {message.text}
            </p>
          )}

          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-medium tracking-tight">Current password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded border border-brand-black/20 px-3 py-2 text-brand-black tracking-tight"
              autoComplete="current-password"
            />
          </label>
          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-medium tracking-tight">New password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded border border-brand-black/20 px-3 py-2 text-brand-black tracking-tight"
              autoComplete="new-password"
            />
          </label>
          <label className="mb-4 block">
            <span className="mb-1 block text-sm font-medium tracking-tight">Confirm new password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded border border-brand-black/20 px-3 py-2 text-brand-black tracking-tight"
              autoComplete="new-password"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded bg-brand-black px-4 py-2 text-sm font-semibold tracking-tight text-brand-white hover:bg-brand-black/90 disabled:opacity-50"
            >
              {loading ? "Updating…" : "Update password"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="rounded border border-brand-black/20 px-4 py-2 text-sm font-medium tracking-tight hover:bg-brand-black/5"
            >
              Cancel
            </button>
          </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
