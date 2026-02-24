"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type LogoutToastContextValue = {
  showLogoutToast: () => void;
};

const LogoutToastContext = createContext<LogoutToastContextValue | null>(null);

const TOAST_DURATION_MS = 2500;

export function LogoutToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showLogoutToast = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(true);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setVisible(false);
    }, TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <LogoutToastContext.Provider value={{ showLogoutToast }}>
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
    </LogoutToastContext.Provider>
  );
}

export function useLogoutToast() {
  const ctx = useContext(LogoutToastContext);
  if (!ctx) throw new Error("useLogoutToast must be used within LogoutToastProvider");
  return ctx;
}
