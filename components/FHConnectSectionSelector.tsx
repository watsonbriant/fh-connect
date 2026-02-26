"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Section } from "@/constants/fhconnectSections";
import { SECTIONS, SECTION_TAB_LABELS } from "@/constants/fhconnectSections";

const ANIMATION_DURATION_MS = 200;

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCloseMenu = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null;
      setMenuOpen(false);
      setIsClosing(false);
    }, ANIMATION_DURATION_MS);
  }, [isClosing]);

  const handleSelectSection = useCallback(
    (tab: Section) => {
      onSectionChange(tab);
      handleCloseMenu();
    },
    [onSectionChange, handleCloseMenu]
  );

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) handleCloseMenu();
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [menuOpen, handleCloseMenu]);

  const isExiting = isClosing;
  const overlayOpacity = isExiting ? "opacity-0" : "opacity-100";
  const contentOpacity = isExiting ? "opacity-0 scale-95" : "opacity-100 scale-100";

  return (
    <>
      <div className="mb-6 flex justify-center">
        {/* Desktop: full pill selector (md and up) */}
        <div
          ref={selectorContainerRef}
          className="relative hidden min-h-[44px] flex-wrap justify-center gap-1 rounded-full border border-brand-black bg-brand-white p-1 md:inline-flex"
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
              {SECTION_TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Mobile: single Menu pill button (below md) */}
        <div className="flex justify-center md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-brand-black bg-brand-white px-3 py-1 text-sm font-bold tracking-tight text-brand-black transition-colors hover:bg-brand-tan"
            aria-label="Open section menu"
            aria-expanded={menuOpen}
          >
            <svg
              className="h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            Menu
          </button>
        </div>
      </div>

      {/* Mobile menu modal (below md) */}
      {(menuOpen || isClosing) && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center px-4 md:hidden ${isClosing ? "pointer-events-none" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="FHConnect sections"
        >
          <div
            className={`absolute inset-0 bg-brand-black/50 transition-opacity duration-200 ease-out ${overlayOpacity}`}
            onClick={handleCloseMenu}
            aria-hidden
          />
          <div
            className={`relative w-full max-w-sm overflow-hidden rounded-3xl border border-brand-black bg-brand-white shadow-lg text-brand-black transition-all duration-200 ease-out ${contentOpacity}`}
          >
            <nav className="flex flex-col py-2" aria-label="FHConnect sections">
              {SECTIONS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleSelectSection(tab)}
                  className={`px-5 py-3 text-left text-sm font-bold tracking-tight transition-colors hover:bg-brand-tan/80 ${
                    section === tab
                      ? "bg-brand-tan/60 text-brand-black"
                      : "text-brand-black"
                  }`}
                >
                  {SECTION_TAB_LABELS[tab]}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
