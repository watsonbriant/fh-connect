"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";

export type AuthModalView = "login" | "register" | "forgot";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAuthChange: () => void;
};

const ANIMATION_DURATION_MS = 200;

const POST_AUTH_REDIRECT = "/fhconnect/profile";

export default function AuthModal({
  isOpen,
  onClose,
  onAuthChange,
}: AuthModalProps) {
  const router = useRouter();
  const [view, setView] = useState<AuthModalView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [animateIn, setAnimateIn] = useState(true);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setView("login");
      setAnimateIn(true);
      const raf = requestAnimationFrame(() => setAnimateIn(false));
      return () => cancelAnimationFrame(raf);
    } else {
      setAnimateIn(true);
    }
  }, [isOpen]);

  // Clear close timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const resetForm = useCallback(() => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setMessage(null);
  }, []);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    resetForm();
    setLoginSuccess(false);
    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null;
      onClose();
      setIsClosing(false);
    }, ANIMATION_DURATION_MS);
  }, [onClose, resetForm, isClosing]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      showMessage("error", "Please enter your email.");
      return;
    }
    if (!password) {
      showMessage("error", "Please enter your password.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
    setLoading(false);
    if (error) {
      showMessage("error", error.message);
      return;
    }
    setLoginSuccess(true);
    setTimeout(() => {
      onAuthChange();
      handleClose();
      setLoginSuccess(false);
      router.push(POST_AUTH_REDIRECT);
    }, 1500);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
      },
    });
    setLoading(false);
    if (error) {
      showMessage("error", error.message);
      return;
    }
    if (data.session) {
      onAuthChange();
      handleClose();
      router.push(POST_AUTH_REDIRECT);
      return;
    }
    showMessage(
      "success",
      "Account created. Check your email to confirm, then sign in."
    );
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}${POST_AUTH_REDIRECT}` : undefined,
    });
    setLoading(false);
    if (error) {
      showMessage("error", error.message);
      return;
    }
    showMessage("success", "Check your email for the reset link.");
  };

  if (!isOpen && !isClosing) return null;

  const modalTitle =
    view === "login" ? "Log in" :
    view === "register" ? "Create an account" :
    "Reset password";

  const isExiting = isClosing;
  const isEntering = animateIn && !isClosing;
  const overlayOpacity = isExiting || isEntering ? "opacity-0" : "opacity-100";
  const contentOpacity = isExiting || isEntering ? "opacity-0 scale-95" : "opacity-100 scale-100";

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${isClosing ? "pointer-events-none" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className={`absolute inset-0 bg-brand-black/80 backdrop-blur-sm transition-opacity duration-200 ease-out ${overlayOpacity}`}
        onClick={handleClose}
        aria-hidden
      />
      <div
        className={`relative w-full max-w-md rounded-lg border border-brand-black/20 bg-brand-white shadow-xl tracking-tight text-brand-black transition-all duration-200 ease-out ${contentOpacity}`}
      >
        <div className="flex items-center justify-between bg-brand-tan border-b border-brand-black/10 px-4 py-3 rounded-t-lg">
          <h2 id="auth-modal-title" className="text-lg font-semibold tracking-tight text-brand-black">
            FHConnect — {modalTitle}
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

        <div className="p-4">
          {loginSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4" aria-live="polite">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600" aria-hidden>
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <p className="text-lg font-medium tracking-tight text-brand-black">You’re signed in.</p>
            </div>
          ) : (
          <>
          {message && (
            <p
              className={`mb-3 rounded px-3 py-2 text-sm tracking-tight ${
                message.type === "error"
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {message.text}
            </p>
          )}

          {view === "login" && (
            <form onSubmit={handleLogin} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium tracking-tight">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded border border-brand-black/20 px-3 py-2 text-brand-black tracking-tight"
                  autoComplete="email"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium tracking-tight">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded border border-brand-black/20 px-3 py-2 text-brand-black tracking-tight"
                  autoComplete="current-password"
                />
              </label>
              <button
                type="button"
                onClick={() => { setView("forgot"); setMessage(null); }}
                className="text-xs font-bold tracking-tight text-brand-black hover:underline"
              >
                Forgot password?
              </button>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded bg-brand-black px-4 py-2 text-sm font-semibold tracking-tight text-brand-white hover:bg-brand-black/90 disabled:opacity-50"
                >
                  {loading ? "Signing in…" : "Log in"}
                </button>
                <button
                  type="button"
                  onClick={() => { setView("register"); setMessage(null); }}
                  className="w-full rounded bg-brand-tan px-4 py-2 text-sm font-semibold tracking-tight text-brand-black hover:bg-brand-tan/90"
                >
                  Create an account
                </button>
              </div>
            </form>
          )}

          {view === "register" && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium tracking-tight">First name</span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full rounded border border-brand-black/20 px-3 py-2 text-brand-black tracking-tight"
                    autoComplete="given-name"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium tracking-tight">Last name</span>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full rounded border border-brand-black/20 px-3 py-2 text-brand-black tracking-tight"
                    autoComplete="family-name"
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-sm font-medium tracking-tight">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded border border-brand-black/20 px-3 py-2 text-brand-black tracking-tight"
                  autoComplete="email"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium tracking-tight">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded border border-brand-black/20 px-3 py-2 text-brand-black tracking-tight"
                  autoComplete="new-password"
                />
              </label>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded bg-brand-black px-4 py-2 text-sm font-semibold tracking-tight text-brand-white hover:bg-brand-black/90 disabled:opacity-50"
                >
                  {loading ? "Creating account…" : "Register"}
                </button>
                <button
                  type="button"
                  onClick={() => { setView("login"); setMessage(null); }}
                  className="w-full rounded border border-brand-black/20 px-4 py-2 text-sm font-medium tracking-tight hover:bg-brand-black/5"
                >
                  Already have an account? Log in
                </button>
              </div>
            </form>
          )}

          {view === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium tracking-tight">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded border border-brand-black/20 px-3 py-2 text-brand-black tracking-tight"
                  autoComplete="email"
                />
              </label>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded bg-brand-black px-4 py-2 text-sm font-semibold tracking-tight text-brand-white hover:bg-brand-black/90 disabled:opacity-50"
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>
                <button
                  type="button"
                  onClick={() => { setView("login"); setMessage(null); }}
                  className="w-full rounded border border-brand-black/20 px-4 py-2 text-sm font-medium tracking-tight hover:bg-brand-black/5"
                >
                  Back to log in
                </button>
              </div>
            </form>
          )}
        </>
          )}
        </div>
      </div>
    </div>
  );
}
