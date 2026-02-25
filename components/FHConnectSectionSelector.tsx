"use client";

import type { Section } from "@/constants/fhconnectSections";
import { SECTIONS } from "@/constants/fhconnectSections";

type Props = {
  section: Section;
  onSectionChange: (tab: Section) => void;
  selectorContainerRef: React.RefObject<HTMLDivElement | null>;
  activeTabRef: React.RefObject<HTMLButtonElement | null>;
  sliderStyle: { left: number; width: number } | null;
};

export default function FHConnectSectionSelector({
  section,
  onSectionChange,
  selectorContainerRef,
  activeTabRef,
  sliderStyle,
}: Props) {
  return (
    <div className="mb-6 flex justify-center">
      <div
        ref={selectorContainerRef}
        className="relative inline-flex min-h-[44px] flex-wrap justify-center gap-1 rounded-full border border-brand-black bg-brand-white p-1"
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
            onClick={() => onSectionChange(tab)}
            className={`relative z-10 min-h-[40px] min-w-[44px] rounded-full px-4 py-2 text-sm font-bold tracking-tight text-brand-black transition-colors hover:bg-brand-black/5 ${
              section === tab ? "text-brand-black" : ""
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
