"use client";

import { SECTION_HEADERS } from "@/constants/fhconnectSections";
import type { Section } from "@/constants/fhconnectSections";

type Props = {
  section: Section;
  email: string;
  onChangePasswordClick: () => void;
};

export default function FHConnectAccountSection({
  section,
  email,
  onChangePasswordClick,
}: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-brand-black bg-brand-white shadow-lg text-brand-black">
      <div className="px-5 py-6">
        <h2 className="mb-4 text-xl font-bold tracking-tight text-brand-black">
          {SECTION_HEADERS[section]}
        </h2>
        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium tracking-tight">Email</span>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full rounded border border-brand-black/10 bg-brand-black/5 px-3 py-2 text-brand-black/70 tracking-tight"
          />
        </label>
        <button
          type="button"
          onClick={onChangePasswordClick}
          className="rounded bg-brand-black px-3 py-1 text-sm font-semibold tracking-tight text-brand-white transition-colors duration-150 hover:bg-brand-black/90 hover:text-brand-tan"
        >
          Change password
        </button>
      </div>
    </div>
  );
}
