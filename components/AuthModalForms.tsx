"use client";

import type { AuthModalView } from "./AuthModal";

const inputClass = "w-full rounded border border-brand-black/20 px-3 py-2 text-brand-black tracking-tight";
const labelClass = "mb-1 block text-sm font-medium tracking-tight";
const blockClass = "block";
const primaryButtonClass = "w-full rounded bg-brand-black px-4 py-2 text-sm font-semibold tracking-tight text-brand-white hover:bg-brand-black/90 disabled:opacity-50";
const secondaryButtonClass = "w-full rounded border border-brand-black/20 px-4 py-2 text-sm font-medium tracking-tight hover:bg-brand-black/5";

type AuthModalFormsProps = {
  view: AuthModalView;
  message: { type: "success" | "error"; text: string } | null;
  loading: boolean;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  setView: (v: AuthModalView) => void;
  setMessage: (m: { type: "success" | "error"; text: string } | null) => void;
  onLogin: (e: React.FormEvent) => void;
  onRegister: (e: React.FormEvent) => void;
  onForgotPassword: (e: React.FormEvent) => void;
};

export default function AuthModalForms({
  view,
  message,
  loading,
  email,
  setEmail,
  password,
  setPassword,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  setView,
  setMessage,
  onLogin,
  onRegister,
  onForgotPassword,
}: AuthModalFormsProps) {
  const switchToForgot = () => { setView("forgot"); setMessage(null); };
  const switchToRegister = () => { setView("register"); setMessage(null); };
  const switchToLogin = () => { setView("login"); setMessage(null); };

  return (
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
        <form onSubmit={onLogin} className="space-y-3">
          <label className={blockClass}>
            <span className={labelClass}>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
              autoComplete="email"
            />
          </label>
          <label className={blockClass}>
            <span className={labelClass}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
              autoComplete="current-password"
            />
          </label>
          <button type="button" onClick={switchToForgot} className="text-xs font-bold tracking-tight text-brand-black hover:underline">
            Forgot password?
          </button>
          <div className="flex flex-col gap-2 pt-2">
            <button type="submit" disabled={loading} className={primaryButtonClass}>
              {loading ? "Signing in…" : "Log in"}
            </button>
            <button type="button" onClick={switchToRegister} className="w-full rounded bg-brand-tan px-4 py-2 text-sm font-semibold tracking-tight text-brand-black hover:bg-brand-tan/90">
              Create an account
            </button>
          </div>
        </form>
      )}

      {view === "register" && (
        <form onSubmit={onRegister} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className={blockClass}>
              <span className={labelClass}>First name</span>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputClass} autoComplete="given-name" />
            </label>
            <label className={blockClass}>
              <span className={labelClass}>Last name</span>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputClass} autoComplete="family-name" />
            </label>
          </div>
          <label className={blockClass}>
            <span className={labelClass}>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} autoComplete="email" />
          </label>
          <label className={blockClass}>
            <span className={labelClass}>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputClass} autoComplete="new-password" />
          </label>
          <div className="flex flex-col gap-2 pt-2">
            <button type="submit" disabled={loading} className={primaryButtonClass}>
              {loading ? "Creating account…" : "Register"}
            </button>
            <button type="button" onClick={switchToLogin} className={secondaryButtonClass}>
              Already have an account? Log in
            </button>
          </div>
        </form>
      )}

      {view === "forgot" && (
        <form onSubmit={onForgotPassword} className="space-y-3">
          <label className={blockClass}>
            <span className={labelClass}>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} autoComplete="email" />
          </label>
          <div className="flex flex-col gap-2 pt-2">
            <button type="submit" disabled={loading} className={primaryButtonClass}>
              {loading ? "Sending…" : "Send reset link"}
            </button>
            <button type="button" onClick={switchToLogin} className={secondaryButtonClass}>
              Back to log in
            </button>
          </div>
        </form>
      )}
    </>
  );
}
