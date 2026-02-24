"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import supabase from "@/lib/supabase";
import { getProfile, getAvatarUrl, uploadAvatar, type Profile } from "@/lib/auth";
import AvatarCropModal from "@/components/AvatarCropModal";

export type AuthModalView = "login" | "register" | "forgot" | "profile";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  onAuthChange: () => void;
};

const ANIMATION_DURATION_MS = 200;

export default function AuthModal({
  isOpen,
  onClose,
  user,
  profile,
  onAuthChange,
}: AuthModalProps) {
  const [view, setView] = useState<AuthModalView>(user ? "profile" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);
  const cropSourceUrlRef = useRef<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [animateIn, setAnimateIn] = useState(true);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When modal opens with a user, always fetch profile so first/last name are populated
  useEffect(() => {
    if (!isOpen || !user) return;
    let cancelled = false;
    getProfile(user.id).then((p) => {
      if (cancelled || !p) return;
      setFirstName(p.first_name ?? "");
      setLastName(p.last_name ?? "");
    });
    return () => { cancelled = true; };
  }, [isOpen, user?.id]);

  useEffect(() => {
    if (view === "profile" && profile) {
      setFirstName((prev) => (profile.first_name != null && profile.first_name !== "" ? profile.first_name : prev));
      setLastName((prev) => (profile.last_name != null && profile.last_name !== "" ? profile.last_name : prev));
    }
  }, [view, profile]);

  useEffect(() => {
    if (isOpen) {
      setView(user ? "profile" : "login");
      setAnimateIn(true);
      const raf = requestAnimationFrame(() => setAnimateIn(false));
      return () => cancelAnimationFrame(raf);
    } else {
      setAnimateIn(true);
    }
  }, [isOpen, user]);

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
    setAvatarFile(null);
    setAvatarPreview(null);
    if (cropSourceUrlRef.current) {
      URL.revokeObjectURL(cropSourceUrlRef.current);
      cropSourceUrlRef.current = null;
      setCropSourceUrl(null);
    }
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
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
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
    }, 1500);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signUp({
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
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
    });
    setLoading(false);
    if (error) {
      showMessage("error", error.message);
      return;
    }
    showMessage("success", "Check your email for the reset link.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onAuthChange();
    handleClose();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (cropSourceUrlRef.current) URL.revokeObjectURL(cropSourceUrlRef.current);
    const url = URL.createObjectURL(file);
    cropSourceUrlRef.current = url;
    setCropSourceUrl(url);
    e.target.value = "";
  };

  const handleCropConfirm = useCallback((blob: Blob) => {
    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(blob));
    if (cropSourceUrlRef.current) {
      URL.revokeObjectURL(cropSourceUrlRef.current);
      cropSourceUrlRef.current = null;
    }
    setCropSourceUrl(null);
  }, []);

  const handleCropCancel = useCallback(() => {
    if (cropSourceUrlRef.current) {
      URL.revokeObjectURL(cropSourceUrlRef.current);
      cropSourceUrlRef.current = null;
    }
    setCropSourceUrl(null);
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage(null);
    const updates: { first_name?: string; last_name?: string; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    if (firstName.trim()) updates.first_name = firstName.trim();
    if (lastName.trim()) updates.last_name = lastName.trim();
    const { error: updateError } = await supabase
      .schema("connect")
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
    if (updateError) {
      showMessage("error", updateError.message);
      setLoading(false);
      return;
    }
    if (avatarFile) {
      const result = await uploadAvatar(user.id, avatarFile, profile?.avatar_path);
      if ("error" in result) {
        showMessage("error", result.error);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    showMessage("success", "Profile updated.");
    onAuthChange();
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  if (!isOpen && !isClosing) return null;

  const avatarUrl = profile?.avatar_path
    ? getAvatarUrl(profile.avatar_path, profile.updated_at)
    : null;
  const displayUrl = avatarPreview || avatarUrl;

  const modalTitle =
    view === "login" ? "Log in" :
    view === "register" ? "Create an account" :
    view === "forgot" ? "Reset password" :
    "My Profile";

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

          {view === "profile" && user && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  {displayUrl ? (
                    <img
                      src={displayUrl}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover ring-2 ring-brand-black/10"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-tan/30 text-2xl font-semibold text-brand-black tracking-tight">
                      {profile
                        ? `${(profile.first_name || "").charAt(0)}${(profile.last_name || "").charAt(0)}`
                        : "?"}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-brand-black text-brand-white shadow">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      onChange={handleAvatarChange}
                    />
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                  </label>
                </div>
                <div className="grid w-full grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium tracking-tight">First name</span>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
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
                      className="w-full rounded border border-brand-black/20 px-3 py-2 text-brand-black tracking-tight"
                      autoComplete="family-name"
                    />
                  </label>
                </div>
                <label className="block w-full">
                  <span className="mb-1 block text-sm font-medium tracking-tight">Email</span>
                  <input
                    type="email"
                    value={profile?.email ?? user.email ?? ""}
                    readOnly
                    className="w-full rounded border border-brand-black/10 bg-brand-black/5 px-3 py-2 text-brand-black/70 tracking-tight"
                  />
                </label>
              </div>
              <div className="flex flex-col gap-2 border-t border-brand-black/10 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded bg-brand-black px-4 py-2 text-sm font-semibold tracking-tight text-brand-white hover:bg-brand-black/90 disabled:opacity-50"
                >
                  {loading ? "Saving…" : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded bg-brand-tan px-4 py-2 text-sm font-semibold tracking-tight text-brand-black hover:bg-brand-tan/90"
                >
                  Log out
                </button>
              </div>
            </form>
          )}
        </>
          )}
        </div>
      </div>
      {cropSourceUrl && (
        <AvatarCropModal
          imageSrc={cropSourceUrl}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
