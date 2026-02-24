"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import { getProfile, getAvatarUrl, uploadAvatar, type Profile } from "@/lib/auth";
import AvatarCropModal from "@/components/AvatarCropModal";

export default function FHConnectPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);
  const cropSourceUrlRef = useRef<string | null>(null);

  const refreshAuth = useCallback(async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u ? { id: u.id, email: u.email ?? undefined } : null);
    if (u) {
      const p = await getProfile(u.id);
      setProfile(p);
      if (p) {
        setFirstName(p.first_name ?? "");
        setLastName(p.last_name ?? "");
      }
    } else {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    refreshAuth().then(() => {
      if (cancelled) return;
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => refreshAuth());
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [refreshAuth]);

  useEffect(() => {
    if (!user && !loading) router.replace("/");
  }, [user, loading, router]);

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
    setAvatarFile(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
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
      setMessage({ type: "error", text: updateError.message });
      setSaving(false);
      return;
    }
    if (avatarFile) {
      const result = await uploadAvatar(user.id, avatarFile, profile?.avatar_path);
      if ("error" in result) {
        setMessage({ type: "error", text: result.error });
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    setMessage({ type: "success", text: "Profile updated." });
    setAvatarFile(null);
    setAvatarPreview(null);
    refreshAuth();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black-950 px-4 py-8">
        <p className="tracking-tight text-brand-white">Loading…</p>
      </main>
    );
  }

  if (!user) return null;

  const avatarUrl = profile?.avatar_path ? getAvatarUrl(profile.avatar_path, profile.updated_at) : null;
  const displayUrl = avatarPreview || avatarUrl;

  return (
    <main className="min-h-screen bg-black-950 tracking-tight text-brand-white">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="rounded-lg border border-brand-black/20 bg-brand-white shadow-xl text-brand-black">
          <div className="flex items-center justify-between border-b border-brand-black/10 bg-brand-tan px-4 py-3 rounded-t-lg">
            <h1 className="text-lg font-semibold tracking-tight text-brand-black">
              FHConnect — My Profile
            </h1>
            <Link
              href="/"
              className="rounded p-1 text-brand-black/70 hover:bg-brand-black/10 hover:text-brand-black"
              aria-label="Back to home"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            {message && (
              <p
                className={`mb-4 rounded px-3 py-2 text-sm tracking-tight ${
                  message.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                }`}
              >
                {message.text}
              </p>
            )}

            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                {displayUrl ? (
                  <img
                    src={displayUrl}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover ring-2 ring-brand-tan"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-tan/30 text-2xl font-semibold text-brand-black">
                    {profile ? `${(profile.first_name || "").charAt(0)}${(profile.last_name || "").charAt(0)}` : "?"}
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

              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
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

            <div className="mt-6 flex flex-col gap-2 border-t border-brand-black/10 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded bg-brand-black px-4 py-2 text-sm font-semibold tracking-tight text-brand-white hover:bg-brand-black/90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
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
        </div>
      </div>

      {cropSourceUrl && (
        <AvatarCropModal
          imageSrc={cropSourceUrl}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </main>
  );
}
