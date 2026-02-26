"use client";

import { useState } from "react";
import type { Person } from "@/lib/auth";
import { SKILLS_CATEGORIES } from "@/constants/skillsCategories";

const ENNEAGRAM_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

const MYERS_BRIGGS_OPTIONS: { value: string; label: string }[] = [
  { value: "ENFJ", label: "Protagonist" },
  { value: "ENFP", label: "Campaigner" },
  { value: "ENTJ", label: "Commander" },
  { value: "ENTP", label: "Debater" },
  { value: "ESFJ", label: "Consul" },
  { value: "ESFP", label: "Entertainer" },
  { value: "ESTJ", label: "Executive" },
  { value: "ESTP", label: "Entrepreneur" },
  { value: "INFJ", label: "Advocate" },
  { value: "INFP", label: "Mediator" },
  { value: "INTJ", label: "Architect" },
  { value: "INTP", label: "Logician" },
  { value: "ISFJ", label: "Defender" },
  { value: "ISFP", label: "Adventurer" },
  { value: "ISTJ", label: "Logistician" },
  { value: "ISTP", label: "Virtuoso" },
];

type Props = {
  person: Person | null;
  enneagram: string;
  onEnneagramChange: (value: string) => void;
  myersBriggs: string;
  onMyersBriggsChange: (value: string) => void;
  /** Category -> selected skill strings */
  selectedSkills: Record<string, string[]>;
  onSkillsChange: (category: string, skill: string, checked: boolean) => void;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
};

export default function FHConnectAboutUsSection({
  person,
  enneagram,
  onEnneagramChange,
  myersBriggs,
  onMyersBriggsChange,
  selectedSkills,
  onSkillsChange,
  editing,
  onEditingChange,
  onSubmit,
  saving,
}: Props) {
  const enneagramRaw = enneagram.trim() || (person?.enneagram ?? "").trim() || "";
  const enneagramPillLabel = enneagramRaw || "Not set";

  const myersBriggsRaw = myersBriggs.trim() || (person?.myersbriggs ?? "").trim() || "";
  const myersBriggsOption = MYERS_BRIGGS_OPTIONS.find((o) => o.value === myersBriggsRaw);
  const myersBriggsPillLabel = myersBriggsOption
    ? `${myersBriggsOption.value} – ${myersBriggsOption.label}`
    : myersBriggsRaw
      ? myersBriggsRaw
      : "Not set";

  const displaySkills: Record<string, string[]> = editing
    ? selectedSkills
    : (person?.skills ?? []).reduce<Record<string, string[]>>((acc, { category, skills }) => {
        acc[category] = skills;
        return acc;
      }, {});

  const [activeSkillsCategory, setActiveSkillsCategory] = useState(
    () => SKILLS_CATEGORIES[0]?.category ?? ""
  );
  const activeCategoryData = SKILLS_CATEGORIES.find((c) => c.category === activeSkillsCategory);

  return (
    <div className="min-w-0 overflow-hidden rounded-3xl border border-brand-black bg-brand-white px-5 py-6 shadow-lg text-brand-black">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight text-brand-black">About Me</h2>
        <form onSubmit={onSubmit} className="flex shrink-0">
          {editing ? (
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-brand-black px-3 py-1 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 hover:text-brand-tan disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setTimeout(() => onEditingChange(true), 0)}
              className="rounded bg-brand-black px-3 py-1 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 hover:text-brand-tan"
            >
              Edit
            </button>
          )}
        </form>
      </div>

      <form onSubmit={onSubmit} className={editing ? "space-y-4" : undefined}>
        <fieldset className="border-0 p-0">
          <legend
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-tight text-brand-black/60 ${editing ? "mb-1" : "mb-2"}`}
          >
            Enneagram
            {!editing && (
              <span className="inline-flex shrink-0 rounded-full bg-brand-black/20 px-2 py-0.5 text-[0.625rem] font-bold tracking-tight text-brand-black">
                {enneagramPillLabel}
              </span>
            )}
          </legend>
          {editing && (
            <div className="flex flex-wrap items-end gap-4" role="radiogroup" aria-label="Enneagram type">
              {ENNEAGRAM_OPTIONS.map((num) => (
                <label
                  key={num}
                  className="flex cursor-pointer flex-col items-center gap-1.5 transition-opacity hover:opacity-90"
                >
                  <span className="text-sm font-medium tracking-tight text-brand-black">{num}</span>
                  <input
                    type="radio"
                    name="enneagram"
                    value={String(num)}
                    checked={enneagram === String(num)}
                    onChange={() => onEnneagramChange(String(num))}
                    className="h-4 w-4 border-brand-black/30 text-brand-black focus:ring-brand-tan"
                  />
                </label>
              ))}
              <label className="flex cursor-pointer flex-col items-center gap-1.5 transition-opacity hover:opacity-90">
                <span className="text-sm font-medium tracking-tight text-brand-black/70">Unknown</span>
                <input
                  type="radio"
                  name="enneagram"
                  value=""
                  checked={enneagram === ""}
                  onChange={() => onEnneagramChange("")}
                  className="h-4 w-4 border-brand-black/30 text-brand-black focus:ring-brand-tan"
                />
              </label>
            </div>
          )}
        </fieldset>

        <fieldset className={`border-0 p-0`}>
          <legend
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-tight text-brand-black/60 ${editing ? "mb-1" : "mb-2"}`}
          >
            Myers Briggs
            {!editing && (
              <span className="inline-flex shrink-0 rounded-full bg-brand-black/20 px-2 py-0.5 text-[0.625rem] font-bold tracking-tight text-brand-black">
                {myersBriggsPillLabel}
              </span>
            )}
          </legend>
          {editing && (
            <div
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              role="radiogroup"
              aria-label="Myers Briggs type"
            >
              {MYERS_BRIGGS_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-90"
                >
                  <input
                    type="radio"
                    name="myersbriggs"
                    value={opt.value}
                    checked={myersBriggs === opt.value}
                    onChange={() => onMyersBriggsChange(opt.value)}
                    className="h-4 w-4 shrink-0 border-brand-black/30 text-brand-black focus:ring-brand-tan"
                  />
                  <span className="text-sm font-medium tracking-tight text-brand-black">
                    {opt.value} – {opt.label}
                  </span>
                </label>
              ))}
              <label className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-90 sm:col-span-2">
                <input
                  type="radio"
                  name="myersbriggs"
                  value=""
                  checked={myersBriggs === ""}
                  onChange={() => onMyersBriggsChange("")}
                  className="h-4 w-4 shrink-0 border-brand-black/30 text-brand-black focus:ring-brand-tan"
                />
                <span className="text-sm font-medium tracking-tight text-brand-black/70">Unknown</span>
              </label>
            </div>
          )}
        </fieldset>

        <div className="mt-3 border-t border-brand-black/20 pt-3">
          <h2 className="mb-4 text-xl font-bold tracking-tight text-brand-black">Skills</h2>
          {editing ? (
            <div className="flex flex-col gap-2 md:flex-row md:gap-4">
              <nav
                className="flex shrink-0 flex-row flex-wrap gap-1 overflow-x-auto pb-1 md:flex-col md:flex-nowrap md:overflow-visible"
                aria-label="Skill categories"
              >
                {SKILLS_CATEGORIES.map(({ category }) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveSkillsCategory(category)}
                    className={`rounded px-2.5 py-0.5 text-left text-xs font-bold tracking-tight transition-colors duration-150 md:py-0.5 md:pr-3 ${
                      activeSkillsCategory === category
                        ? "bg-brand-black text-brand-white"
                        : "bg-brand-black/10 text-brand-black hover:bg-brand-black/20"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </nav>
              <div className="min-w-0 flex-1">
                {activeCategoryData && (
                  <>
                    <ul className="flex flex-col gap-1.5">
                      {activeCategoryData.skills.map((skill) => (
                        <li key={skill}>
                          <label className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-90">
                            <input
                              type="checkbox"
                              checked={(selectedSkills[activeCategoryData.category] ?? []).includes(skill)}
                              onChange={(e) =>
                                onSkillsChange(activeCategoryData.category, skill, e.target.checked)
                              }
                              className="h-4 w-4 shrink-0 border-brand-black/30 text-brand-black focus:ring-brand-tan"
                            />
                            <span className="text-sm font-medium tracking-tight text-brand-black">
                              {skill}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {SKILLS_CATEGORIES.map(({ category }) => {
                const selected = displaySkills[category] ?? [];
                if (selected.length === 0) return null;
                return (
                  <div key={category} className="flex flex-wrap items-center gap-1">
                    <span className="pr-1 text-xs font-bold uppercase tracking-tight text-brand-black/60">
                      {category}
                    </span>
                    {selected.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex rounded-full bg-brand-black/20 px-2 py-0.5 text-[0.625rem] font-bold tracking-tight text-brand-black"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                );
              })}
              {SKILLS_CATEGORIES.every(
                (c) => (displaySkills[c.category] ?? []).length === 0
              ) && (
                <p className="text-sm tracking-tight text-brand-black/80">None selected</p>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
