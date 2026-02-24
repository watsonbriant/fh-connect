"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import supabase from "@/lib/supabase";
import { getProfile, getAvatarUrl, uploadAvatar, type Profile } from "@/lib/auth";
import AvatarCropModal from "@/components/AvatarCropModal";
import AuthModal from "@/components/AuthModal";
import ChangePasswordModal from "@/components/ChangePasswordModal";

const SECTIONS = ["Account", "Profile", "Giving", "Groups", "Serving"] as const;
type Section = (typeof SECTIONS)[number];
const SECTION_SLUGS = SECTIONS.map((s) => s.toLowerCase());

const SECTION_HEADERS: Record<Section, string> = {
  Account: "Account Settings",
  Profile: "Profile Information",
  Giving: "My Giving",
  Groups: "My Groups",
  Serving: "My Serves",
};

function sectionFromSlug(slug: string | undefined): Section {
  if (!slug) return "Account";
  const i = SECTION_SLUGS.indexOf(slug);
  return i >= 0 ? SECTIONS[i] : "Account";
}

export default function FHConnectPage() {
  const router = useRouter();
  const params = useParams();
  const segment = params.section as string[] | undefined;
  const slug = segment?.[0];
  const section = sectionFromSlug(slug);

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
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [gateAuthModalOpen, setGateAuthModalOpen] = useState(false);

  const selectorContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const tab = activeTabRef.current;
    const container = selectorContainerRef.current;
    if (!tab || !container) return;
    const tabRect = tab.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setSliderStyle({
      left: tabRect.left - containerRect.left,
      width: tabRect.width,
    });
  }, [section]);

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
    if (loading) return;
    if (!segment || segment.length === 0) {
      router.replace("/fhconnect/account");
    }
  }, [loading, segment, router]);

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

  const goToSection = (tab: Section) => {
    router.push(`/fhconnect/${tab.toLowerCase()}`);
  };

  const avatarUrl = profile?.avatar_path ? getAvatarUrl(profile.avatar_path, profile.updated_at) : null;
  const displayUrl = avatarPreview || avatarUrl;

  if (!user && !loading && !changePasswordOpen) {
    return (
      <main className="min-h-screen bg-black-950 tracking-tight text-brand-white">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight text-brand-white sm:text-3xl">
            FHConnect
          </h1>
          <div className="rounded-3xl border border-brand-black bg-brand-white shadow-lg text-brand-black px-6 py-8 text-center max-w-md">
            <h2 className="mb-3 text-xl font-bold tracking-tight text-brand-black">
              Sign in required
            </h2>
            <p className="mb-6 text-brand-black/80 tracking-tight text-sm">
              You must be logged in to access FHConnect. Log in or create an account to continue.
            </p>
            <button
              type="button"
              onClick={() => setGateAuthModalOpen(true)}
              className="rounded bg-brand-black px-5 py-2.5 text-sm font-semibold tracking-tight text-brand-white hover:bg-brand-black/90"
            >
              Log in
            </button>
          </div>
        </div>
        <AuthModal
          isOpen={gateAuthModalOpen}
          onClose={() => setGateAuthModalOpen(false)}
          onAuthChange={refreshAuth}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black-950 tracking-tight text-brand-white">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight text-brand-white sm:text-3xl">
          FHConnect
        </h1>
        {/* Section selector */}
        <div className="mb-6 flex justify-center">
          <div
            ref={selectorContainerRef}
            className="relative inline-flex flex-wrap justify-center gap-1 rounded-full border border-brand-black bg-brand-white p-1 min-h-[44px]"
            role="tablist"
            aria-label="FHConnect sections"
          >
            {sliderStyle && (
              <div
                className="absolute top-1 bottom-1 rounded-full bg-brand-tan transition-all duration-200 ease-out"
                style={{ left: sliderStyle.left, width: sliderStyle.width }}
                aria-hidden
              />
            )}
            {SECTIONS.map((tab) => (
              <button
                key={tab}
                ref={section === tab ? activeTabRef : undefined}
                type="button"
                role="tab"
                aria-selected={section === tab}
                onClick={() => goToSection(tab)}
                className={`relative z-10 min-h-[40px] min-w-[44px] rounded-full px-4 py-2 text-sm font-bold tracking-tight text-brand-black transition-colors hover:bg-brand-black/5 ${
                  section === tab ? "text-brand-black" : ""
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-brand-black bg-brand-white shadow-lg text-brand-black">
          {loading ? (
            <div className="px-5 py-6">
              <h2 className="mb-4 text-xl font-bold tracking-tight text-brand-black">
                {SECTION_HEADERS[section]}
              </h2>
              <div className="flex min-h-[160px] items-center justify-center">
                <p className="tracking-tight text-brand-black/70">Loading…</p>
              </div>
            </div>
          ) : section === "Account" && user ? (
            <div className="px-5 py-6">
              <h2 className="mb-4 text-xl font-bold tracking-tight text-brand-black">
                {SECTION_HEADERS[section]}
              </h2>
              <label className="mb-4 block">
                <span className="mb-1 block text-sm font-medium tracking-tight">Email</span>
                <input
                  type="email"
                  value={profile?.email ?? user.email ?? ""}
                  readOnly
                  className="w-full rounded border border-brand-black/10 bg-brand-black/5 px-3 py-2 text-brand-black/70 tracking-tight"
                />
              </label>
              <button
                type="button"
                onClick={() => setChangePasswordOpen(true)}
                className="rounded bg-brand-black px-4 py-2 text-sm font-semibold tracking-tight text-brand-white hover:bg-brand-black/90"
              >
                Change password
              </button>
            </div>
          ) : section === "Profile" && user ? (
            <form onSubmit={handleSubmit} className="px-5 py-6">
              <h2 className="mb-4 text-xl font-bold tracking-tight text-brand-black">
                {SECTION_HEADERS[section]}
              </h2>
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
              </div>

              <div className="mt-6 flex flex-col gap-2 border-t border-brand-black/10 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded bg-brand-black px-4 py-2 text-sm font-semibold tracking-tight text-brand-white hover:bg-brand-black/90 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="px-5 py-6">
              <h2 className="mb-4 text-xl font-bold tracking-tight text-brand-black">
                {SECTION_HEADERS[section]}
              </h2>
              <p className="text-center text-brand-black/70 tracking-tight">{section} content coming soon.</p>
            </div>
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
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        userEmail={profile?.email ?? user?.email ?? ""}
      />
    </main>
  );
}
