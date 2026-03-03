"use client";

import type { Profile, Person } from "@/lib/auth";
import type { ProfileFormState } from "@/components/FHConnectProfileCard";
import type { Section } from "@/constants/fhconnectSections";
import FHConnectProfileCard from "@/components/FHConnectProfileCard";
import HouseholdSection from "@/components/HouseholdSection";
import FHConnectAboutUsSection from "@/components/FHConnectAboutUsSection";

type FHConnectProfileContentProps = {
  section: Section;
  message: { type: "success" | "error"; text: string } | null;
  messageEntered: boolean;
  messageExiting: boolean;
  user: { id: string; email?: string };
  profile: Profile | null;
  person: Person | null;
  profileForm: ProfileFormState;
  onProfileFormChange: React.Dispatch<React.SetStateAction<ProfileFormState>>;
  profileEditing: boolean;
  onProfileEditingChange: (v: boolean) => void;
  displayUrl: string | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  onMessage: (type: "success" | "error", text: string) => void;
  aboutEnneagram: string;
  onAboutEnneagramChange: (v: string) => void;
  aboutMyersBriggs: string;
  onAboutMyersBriggsChange: (v: string) => void;
  aboutSkills: Record<string, string[]>;
  onAboutSkillsChange: (category: string, skill: string, checked: boolean) => void;
  aboutEditing: boolean;
  onAboutEditingChange: (v: boolean) => void;
  onAboutUsSubmit: (e: React.FormEvent) => void;
  aboutSaving: boolean;
};

export default function FHConnectProfileContent({
  section,
  message,
  messageEntered,
  messageExiting,
  user,
  profile,
  person,
  profileForm,
  onProfileFormChange,
  profileEditing,
  onProfileEditingChange,
  displayUrl,
  onAvatarChange,
  onSubmit,
  saving,
  onMessage,
  aboutEnneagram,
  onAboutEnneagramChange,
  aboutMyersBriggs,
  onAboutMyersBriggsChange,
  aboutSkills,
  onAboutSkillsChange,
  aboutEditing,
  onAboutEditingChange,
  onAboutUsSubmit,
  aboutSaving,
}: FHConnectProfileContentProps) {
  return (
    <>
      {message && (
        <p
          role="alert"
          className={`mb-4 rounded px-3 py-2 text-sm tracking-tight transition-all duration-200 ease-out ${
            message.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          } ${
            !messageEntered
              ? "-translate-y-2 opacity-0"
              : messageExiting
                ? "translate-y-2 opacity-0"
                : "translate-y-0 opacity-100"
          }`}
        >
          {message.text}
        </p>
      )}
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        <div className="order-1 min-w-0 md:col-start-1 md:row-start-1">
          <FHConnectProfileCard
            section={section}
            profile={profile}
            person={person}
            form={profileForm}
            onFormChange={onProfileFormChange}
            editing={profileEditing}
            onEditingChange={onProfileEditingChange}
            displayUrl={displayUrl}
            onAvatarChange={onAvatarChange}
            onSubmit={onSubmit}
            saving={saving}
            emailDisplay={profile?.email ?? user?.email ?? ""}
          />
        </div>
        {profile?.person_id && (
          <div className="order-2 min-w-0 md:col-start-2 md:row-span-2 md:row-start-1">
            <div className="overflow-hidden rounded-3xl border border-brand-black bg-brand-white px-5 py-6 shadow-lg text-brand-black">
              <HouseholdSection
                personId={profile.person_id}
                onMessage={onMessage}
              />
            </div>
          </div>
        )}
        <div className="order-3 min-w-0 md:col-start-1 md:row-start-2">
          <FHConnectAboutUsSection
            person={person}
            enneagram={aboutEnneagram}
            onEnneagramChange={onAboutEnneagramChange}
            myersBriggs={aboutMyersBriggs}
            onMyersBriggsChange={onAboutMyersBriggsChange}
            selectedSkills={aboutSkills}
            onSkillsChange={onAboutSkillsChange}
            editing={aboutEditing}
            onEditingChange={onAboutEditingChange}
            onSubmit={onAboutUsSubmit}
            saving={aboutSaving}
          />
        </div>
      </div>
    </>
  );
}
