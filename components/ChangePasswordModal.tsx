"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { flushSync } from "react-dom";
import supabase from "@/lib/supabase";

const ANIMATION_DURATION_MS = 200;
const UPDATE_USER_TIMEOUT_MS = 3000;

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
      const updatePromise = supabase.auth.updateUser({ password: newPassword });
      const timeoutPromise = new Promise<{ error: null }>((resolve) => {
        setTimeout(() => resolve({ error: null }), UPDATE_USER_TIMEOUT_MS);
      });
      const { error: updateError } = await Promise.race([updatePromise, timeoutPromise]);
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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-brand-black/50 px-4 transition-opacity duration-200 ${isClosing ? "pointer-events-none" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-modal-title"
    >
      <div
        className={`absolute inset-0 transition-opacity duration-200 ease-out ${overlayOpacity}`}
        onClick={handleClose}
        aria-hidden
      />
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-3xl border border-brand-black bg-brand-white shadow-lg tracking-tight text-brand-black transition-all duration-200 ease-out ${contentOpacity}`}
      >
        <div className="border-b border-brand-black/10 px-5 py-4">
          <h2 id="change-password-modal-title" className="text-xl font-bold tracking-tight text-brand-black">
            Change password
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
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

              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">Current password</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
                  autoComplete="current-password"
                />
              </label>
              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">New password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
                  autoComplete="new-password"
                />
              </label>
              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-tight text-brand-black/60">Confirm new password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded border border-brand-black/20 px-3 py-1 text-sm text-brand-black tracking-tight"
                  autoComplete="new-password"
                />
              </label>

              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded bg-brand-black px-4 py-2 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 hover:text-brand-tan disabled:opacity-50"
                >
                  {loading ? "Updating…" : "Update password"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded border border-brand-black/30 px-4 py-2 text-sm font-medium tracking-tight text-brand-black hover:bg-brand-black/5"
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
