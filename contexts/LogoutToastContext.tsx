"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type LogoutToastContextValue = {
  showLogoutToast: () => void;
  clearEmailConfirmedFlag: () => void;
};

const LogoutToastContext = createContext<LogoutToastContextValue | null>(null);

const TOAST_DURATION_MS = 2500;
const EMAIL_CONFIRMED_STORAGE_KEY = "email_confirmed_toast_shown";

function parseHashParams(hash: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (!hash || !hash.startsWith("#")) return params;
  const query = hash.slice(1);
  query.split("&").forEach((pair) => {
    const [key, value] = pair.split("=").map(decodeURIComponent);
    if (key && value) params[key] = value;
  });
  return params;
}

export function LogoutToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [emailConfirmedVisible, setEmailConfirmedVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailConfirmedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showLogoutToast = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(true);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setVisible(false);
    }, TOAST_DURATION_MS);
  }, []);

  const showEmailConfirmedToast = useCallback(() => {
    if (emailConfirmedTimeoutRef.current) clearTimeout(emailConfirmedTimeoutRef.current);
    setEmailConfirmedVisible(true);
    emailConfirmedTimeoutRef.current = setTimeout(() => {
      emailConfirmedTimeoutRef.current = null;
      setEmailConfirmedVisible(false);
    }, TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = parseHashParams(window.location.hash);
    const type = params.type;
    const isEmailConfirmation = type === "signup" || type === "email";
    if (isEmailConfirmation && !sessionStorage.getItem(EMAIL_CONFIRMED_STORAGE_KEY)) {
      sessionStorage.setItem(EMAIL_CONFIRMED_STORAGE_KEY, "1");
      showEmailConfirmedToast();
    }
  }, [showEmailConfirmedToast]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (emailConfirmedTimeoutRef.current) clearTimeout(emailConfirmedTimeoutRef.current);
    };
  }, []);

  const clearEmailConfirmedFlag = useCallback(() => {
    if (typeof window !== "undefined") sessionStorage.removeItem(EMAIL_CONFIRMED_STORAGE_KEY);
  }, []);

  return (
    <LogoutToastContext.Provider value={{ showLogoutToast, clearEmailConfirmedFlag }}>
      {children}
      {visible && (
        <div
          className="fixed left-1/2 top-20 z-[200] -translate-x-1/2 rounded-lg border border-brand-black/20 bg-brand-tan px-5 py-3 shadow-lg tracking-tight text-brand-black"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-semibold">You&apos;ve been logged out.</p>
        </div>
      )}
      {emailConfirmedVisible && (
        <div
          className="fixed left-1/2 top-20 z-[200] flex -translate-x-1/2 items-center gap-2 rounded-lg border border-green-700/30 bg-green-600 px-5 py-3 shadow-lg tracking-tight text-white"
          role="status"
          aria-live="polite"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <p className="text-sm font-semibold">Your email address is now confirmed.</p>
        </div>
      )}
    </LogoutToastContext.Provider>
  );
}

export function useLogoutToast() {
  const ctx = useContext(LogoutToastContext);
  if (!ctx) throw new Error("useLogoutToast must be used within LogoutToastProvider");
  return ctx;
}
