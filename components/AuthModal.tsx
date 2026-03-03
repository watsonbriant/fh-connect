"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import {
  ANIMATION_DURATION_MS,
  POST_AUTH_REDIRECT,
  AUTH_TIMEOUT_MS,
  REGISTER_FORGOT_TIMEOUT_MS,
  timeoutReject,
} from "@/components/authModalUtils";
import AuthModalForms from "@/components/AuthModalForms";

export type AuthModalView = "login" | "register" | "forgot";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Called after successful login; may be async. We await it so Header/auth is updated before redirect. */
  onAuthChange: () => void | Promise<void>;
};

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

  const scheduleCloseAndRedirect = useCallback(() => {
    setTimeout(() => {
      handleClose();
      setLoginSuccess(false);
      router.push(POST_AUTH_REDIRECT);
    }, 1500);
  }, [handleClose, router]);

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
    try {
      const signInPromise = supabase.auth.signInWithPassword({ email: trimmedEmail, password });
      const timeoutPromise = timeoutReject<never>(AUTH_TIMEOUT_MS, "Connection timed out.");
      const { error } = await Promise.race([signInPromise, timeoutPromise]);
      if (error) {
        showMessage("error", error.message);
        return;
      }
      setLoginSuccess(true);
      await onAuthChange();
      scheduleCloseAndRedirect();
    } catch (err) {
      const isTimeout = err instanceof Error && err.message === "Connection timed out.";
      if (isTimeout) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setLoginSuccess(true);
          await onAuthChange();
          scheduleCloseAndRedirect();
          return;
        }
        showMessage("error", "Connection timed out. Please check your connection and try again.");
      } else {
        const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
        showMessage("error", message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: { data: { first_name: firstName, last_name: lastName } },
      });
      const timeoutPromise = timeoutReject<never>(REGISTER_FORGOT_TIMEOUT_MS, "Connection timed out.");
      const { data, error } = await Promise.race([signUpPromise, timeoutPromise]);
      if (error) {
        // "Database error saving new user" usually means a Supabase trigger on auth.users (e.g. inserting into connect.profiles) failed. Check Database → Triggers and the target table schema/RLS.
        const isDbError = /database error saving new user/i.test(error.message);
        showMessage(
          "error",
          isDbError
            ? "Account creation failed on our side. Please try again later or contact support."
            : error.message
        );
        return;
      }
      if (data.session) {
        onAuthChange();
        handleClose();
        router.push(POST_AUTH_REDIRECT);
        return;
      }
      showMessage("success", "Account created. Check your email to confirm, then sign in.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      showMessage("error", msg === "Connection timed out." ? "Connection timed out. Please check your connection and try again." : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const resetPromise = supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}${POST_AUTH_REDIRECT}` : undefined,
      });
      const timeoutPromise = timeoutReject<never>(REGISTER_FORGOT_TIMEOUT_MS, "Connection timed out.");
      const { error } = await Promise.race([resetPromise, timeoutPromise]);
      if (error) {
        showMessage("error", error.message);
        return;
      }
      showMessage("success", "Check your email for the reset link.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      showMessage("error", msg === "Connection timed out." ? "Connection timed out. Please check your connection and try again." : msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !isClosing) return null;

  const modalTitle = view === "login" ? "Log in" : view === "register" ? "Create an account" : "Reset password";
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
            <AuthModalForms
              view={view}
              message={message}
              loading={loading}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              setView={setView}
              setMessage={setMessage}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onForgotPassword={handleForgotPassword}
            />
          )}
        </div>
      </div>
    </div>
  );
}
