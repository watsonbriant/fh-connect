"use client";

import { SECTION_HEADERS } from "@/constants/fhconnectSections";
import type { Section } from "@/constants/fhconnectSections";

type Props = {
  section: Section;
};

export default function FHConnectPlaceholderSection({ section }: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-brand-black bg-brand-white shadow-lg text-brand-black">
      <div className="px-5 py-6">
        <h2 className="mb-4 text-xl font-bold tracking-tight text-brand-black">
          {SECTION_HEADERS[section]}
        </h2>
        <p className="text-center tracking-tight text-brand-black/70">
          {section} content coming soon.
        </p>
      </div>
    </div>
  );
}
