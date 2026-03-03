"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import supabase from "@/lib/supabase";
import {
  getProfile,
  getPerson,
  getAvatarUrl,
  uploadAvatar,
  updatePerson,
  type Profile,
  type Person,
} from "@/lib/auth";
import AvatarCropModal from "@/components/AvatarCropModal";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import HouseholdSection from "@/components/HouseholdSection";
import FHConnectSectionSelector from "@/components/FHConnectSectionSelector";
import FHConnectProfileCard, {
  type ProfileFormState,
} from "@/components/FHConnectProfileCard";
import FHConnectAboutUsSection from "@/components/FHConnectAboutUsSection";
import FHConnectAccountSection from "@/components/FHConnectAccountSection";
import FHConnectPlaceholderSection from "@/components/FHConnectPlaceholderSection";
import FHConnectGate from "@/components/FHConnectGate";
import FHConnectProfileContent from "@/components/FHConnectProfileContent";
import {
  SECTION_HEADERS,
  sectionFromSlug,
  type Section,
} from "@/constants/fhconnectSections";

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
  const [messageEntered, setMessageEntered] = useState(false);
  const [messageExiting, setMessageExiting] = useState(false);
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [person, setPerson] = useState<Person | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);
  const cropSourceUrlRef = useRef<string | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [gateAuthModalOpen, setGateAuthModalOpen] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [aboutEditing, setAboutEditing] = useState(false);
  const [aboutEnneagram, setAboutEnneagram] = useState("");
  const [aboutMyersBriggs, setAboutMyersBriggs] = useState("");
  const [aboutSkills, setAboutSkills] = useState<Record<string, string[]>>({});
  const [aboutSaving, setAboutSaving] = useState(false);

  const selectorContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const lastSignedInAtRef = useRef<number>(0);
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
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    setUser(u ? { id: u.id, email: u.email ?? undefined } : null);
    if (u) {
      const p = await getProfile(u.id);
      setProfile(p);
      if (p?.person_id) {
        const personData = await getPerson(p.person_id);
        setPerson(personData ?? null);
      } else {
        setPerson(null);
      }
    } else {
      setProfile(null);
      setPerson(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    refreshAuth().then(() => {
      if (cancelled) return;
      setLoading(false);
    });
    const IGNORE_SIGNED_OUT_MS = 5000;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        lastSignedInAtRef.current = Date.now();
      }
      if (event === "SIGNED_OUT" && Date.now() - lastSignedInAtRef.current < IGNORE_SIGNED_OUT_MS) {
        return;
      }
      refreshAuth();
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [refreshAuth]);

  useEffect(() => {
    if (!aboutEditing) return;
    setAboutEnneagram(person?.enneagram ?? "");
    setAboutMyersBriggs(person?.myersbriggs ?? "");
    const skillsRecord: Record<string, string[]> = {};
    for (const { category, skills } of person?.skills ?? []) {
      skillsRecord[category] = skills;
    }
    setAboutSkills(skillsRecord);
  }, [aboutEditing, person?.enneagram, person?.myersbriggs, person?.skills]);

  useEffect(() => {
    if (!person || profileEditing) return;
    setProfileForm({
      prefix: person.prefix ?? null,
      first_name: person.first_name ?? null,
      middle_name: person.middle_name ?? null,
      last_name: person.last_name ?? null,
      suffix: person.suffix ?? null,
      preferred_name: person.preferred_name ?? null,
      phone_number: person.phone_number ?? null,
      date_of_birth: person.date_of_birth ?? null,
      gender: person.gender ?? null,
      marital_status: person.marital_status ?? null,
    });
  }, [person, profileEditing]);

  useEffect(() => {
    if (loading) return;
    if (!segment || segment.length === 0) {
      router.replace("/fhconnect/profile");
    }
  }, [loading, segment, router]);

  useEffect(() => {
    if (!message) {
      setMessageEntered(false);
      setMessageExiting(false);
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }
      return;
    }
    setMessageExiting(false);
    const enterId = requestAnimationFrame(() => setMessageEntered(true));
    messageTimeoutRef.current = setTimeout(() => setMessageExiting(true), 3000);
    return () => {
      cancelAnimationFrame(enterId);
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }
    };
  }, [message]);

  useEffect(() => {
    if (!messageExiting) return;
    const t = setTimeout(() => {
      setMessage(null);
      setMessageEntered(false);
      setMessageExiting(false);
    }, 300);
    return () => clearTimeout(t);
  }, [messageExiting]);

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
    if (!user || !profile?.person_id) return;
    setSaving(true);
    setMessage(null);
    const { error: personError } = await updatePerson(
      profile.person_id,
      {
        prefix: profileForm.prefix ?? null,
        first_name: profileForm.first_name ?? null,
        middle_name: profileForm.middle_name ?? null,
        last_name: profileForm.last_name ?? null,
        suffix: profileForm.suffix ?? null,
        preferred_name: profileForm.preferred_name ?? null,
        phone_number: profileForm.phone_number ?? null,
        date_of_birth: profileForm.date_of_birth ?? null,
        gender: profileForm.gender ?? null,
        marital_status: profileForm.marital_status ?? null,
      },
      user.id
    );
    if (personError) {
      setMessage({ type: "error", text: personError });
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
    setProfileEditing(false);
    refreshAuth();
  };

  const handleAboutUsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aboutEditing) return;
    if (!user || !profile?.person_id) return;
    setAboutSaving(true);
    setMessage(null);
    const skillsPayload = Object.entries(aboutSkills)
      .filter(([, skills]) => skills.length > 0)
      .map(([category, skills]) => ({ category, skills }));
    const { error } = await updatePerson(
      profile.person_id,
      {
        enneagram: aboutEnneagram.trim() || null,
        myersbriggs: aboutMyersBriggs.trim() || null,
        skills: skillsPayload,
      },
      user.id
    );
    if (error) {
      setMessage({ type: "error", text: error });
      setAboutSaving(false);
      return;
    }
    setAboutSaving(false);
    setMessage({ type: "success", text: "About Me section updated." });
    setAboutEditing(false);
    refreshAuth();
  };

  const goToSection = (tab: Section) => {
    router.push(`/fhconnect/${tab.toLowerCase()}`);
  };

  const avatarUrl = profile?.avatar_path
    ? getAvatarUrl(profile.avatar_path, profile.updated_at)
    : null;
  const displayUrl = avatarPreview || avatarUrl;

  if (!user && !loading && !changePasswordOpen) {
    return (
      <FHConnectGate
        authModalOpen={gateAuthModalOpen}
        onOpenAuthModal={() => setGateAuthModalOpen(true)}
        onCloseAuthModal={() => setGateAuthModalOpen(false)}
        onAuthChange={refreshAuth}
      />
    );
  }

  return (
    <main className="min-h-screen bg-black-950 tracking-tight text-brand-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight text-brand-white sm:text-3xl">
          FHConnect
        </h1>

        <FHConnectSectionSelector
          section={section}
          onSectionChange={goToSection}
          selectorContainerRef={selectorContainerRef}
          activeTabRef={activeTabRef}
          sliderStyle={sliderStyle}
        />

        {loading ? (
          <div className="overflow-hidden rounded-3xl border border-brand-black bg-brand-white shadow-lg text-brand-black">
            <div className="px-5 py-6">
              <h2 className="mb-4 text-xl font-bold tracking-tight text-brand-black">
                {SECTION_HEADERS[section]}
              </h2>
              <div className="flex min-h-[160px] items-center justify-center">
                <p className="tracking-tight text-brand-black/70">Loading…</p>
              </div>
            </div>
          </div>
        ) : section === "Profile" && user ? (
          <FHConnectProfileContent
            section={section}
            message={message}
            messageEntered={messageEntered}
            messageExiting={messageExiting}
            user={user}
            profile={profile}
            person={person}
            profileForm={profileForm}
            onProfileFormChange={setProfileForm}
            profileEditing={profileEditing}
            onProfileEditingChange={setProfileEditing}
            displayUrl={displayUrl}
            onAvatarChange={handleAvatarChange}
            onSubmit={handleSubmit}
            saving={saving}
            onMessage={(type, text) => setMessage({ type, text })}
            aboutEnneagram={aboutEnneagram}
            onAboutEnneagramChange={setAboutEnneagram}
            aboutMyersBriggs={aboutMyersBriggs}
            onAboutMyersBriggsChange={setAboutMyersBriggs}
            aboutSkills={aboutSkills}
            onAboutSkillsChange={(category, skill, checked) => {
              setAboutSkills((prev) => {
                const arr = prev[category] ?? [];
                const next = { ...prev };
                if (checked) next[category] = [...arr, skill];
                else {
                  next[category] = arr.filter((s) => s !== skill);
                  if (next[category].length === 0) delete next[category];
                }
                return next;
              });
            }}
            aboutEditing={aboutEditing}
            onAboutEditingChange={setAboutEditing}
            onAboutUsSubmit={handleAboutUsSubmit}
            aboutSaving={aboutSaving}
          />
        ) : section === "Account" && user ? (
          <FHConnectAccountSection
            section={section}
            email={profile?.email ?? user.email ?? ""}
            onChangePasswordClick={() => setChangePasswordOpen(true)}
          />
        ) : (
          <FHConnectPlaceholderSection section={section} />
        )}
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
