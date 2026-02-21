"use client";

import { useEffect, useState } from "react";

const SCROLL_THRESHOLD = 100;

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      const isScrollable = document.documentElement.scrollHeight > window.innerHeight;
      const pastTop = window.scrollY > SCROLL_THRESHOLD;
      setVisible(isScrollable && pastTop);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`border border-brand-black/20 group fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-brand-tan text-brand-black shadow-lg transition-all duration-200 hover:scale-105 hover:bg-brand-white/20 focus:outline-none ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <svg
        className="h-6 w-6 stroke-2 transition-[stroke-width] duration-200 group-hover:stroke-[3]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
}
