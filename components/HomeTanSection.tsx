"use client";

import { MapPin, BookOpen, Users, Plus, Instagram } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

/** Expandable content for Join us. campus items */
const JOIN_US_CONTENT: Record<string, React.ReactNode> = {
  "Central Campus": (
    <div className="grid w-max max-w-full grid-cols-1 gap-2 text-center">
      <Link
        href="https://www.google.com/maps/search/?api=1&query=2638+Salome+Church+Road+Charlotte+NC+28262"
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full flex-col items-center justify-center rounded border border-brand-black/20 bg-brand-white px-3 py-2 text-xs font-semibold tracking-tight text-brand-black hover:border-brand-tan hover:bg-brand-tan hover:text-brand-black"
      >
        <span>2638 Salome Church Road</span>
        <span>Charlotte NC 28262</span>
      </Link>
      <Link
        href="#"
        className="flex w-full flex-col items-center justify-center rounded border border-brand-black/20 bg-brand-white px-3 py-2 text-center text-xs tracking-tight text-brand-black hover:border-brand-tan hover:bg-brand-tan hover:text-brand-black"
      >
        <span className="font-semibold">Sunday Services</span>
        <span className="font-normal">9:15a + 11a</span>
      </Link>
      <Link
        href="https://instagram.com/freedomhouse"
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-1.5 rounded border-0 px-2 py-1.5 text-xs font-semibold tracking-tight text-white shadow-sm transition-[filter] hover:brightness-110 [background:linear-gradient(135deg,#Ffd600,#ff7a00,#ff0069,#d300c5,#7638fa)]"
      >
        <Instagram className="h-3.5 w-3.5 shrink-0" aria-hidden />
        @freedomhouse
      </Link>
    </div>
  ),
  "South End Campus": (
    <div className="grid w-max max-w-full grid-cols-1 gap-2 text-center">
      <Link
        href="https://www.google.com/maps/search/?api=1&query=3000+Griffith+Street+Charlotte+NC+28203"
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full flex-col items-center justify-center rounded border border-brand-black/20 bg-brand-white px-3 py-2 text-xs font-semibold tracking-tight text-brand-black hover:border-brand-tan hover:bg-brand-tan hover:text-brand-black"
      >
        <span>3000 Griffith Street</span>
        <span>Charlotte NC 28203</span>
      </Link>
      <Link
        href="#"
        className="flex w-full flex-col items-center justify-center rounded border border-brand-black/20 bg-brand-white px-3 py-2 text-center text-xs tracking-tight text-brand-black hover:border-brand-tan hover:bg-brand-tan hover:text-brand-black"
      >
        <span className="font-semibold">Sunday Services</span>
        <span className="font-normal">9:15a + 11a</span>
      </Link>
      <Link
        href="https://instagram.com/freedomhousesouthend"
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-1.5 rounded border-0 px-2 py-1.5 text-xs font-semibold tracking-tight text-white shadow-sm transition-[filter] hover:brightness-110 [background:linear-gradient(135deg,#Ffd600,#ff7a00,#ff0069,#d300c5,#7638fa)]"
      >
        <Instagram className="h-3.5 w-3.5 shrink-0" aria-hidden />
        @freedomhousesouthend
      </Link>
    </div>
  ),
  "Lake Norman Campus": (
    <div className="grid w-max max-w-full grid-cols-1 gap-2 text-center">
      <Link
        href="https://www.google.com/maps/search/?api=1&query=20310+Sefton+Park+Road+Cornelius+NC+28031"
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full flex-col items-center justify-center rounded border border-brand-black/20 bg-brand-white px-3 py-2 text-xs font-semibold tracking-tight text-brand-black hover:border-brand-tan hover:bg-brand-tan hover:text-brand-black"
      >
        <span>20310 Sefton Park Road</span>
        <span>Cornelius NC 28031</span>
      </Link>
      <Link
        href="#"
        className="flex w-full flex-col items-center justify-center rounded border border-brand-black/20 bg-brand-white px-3 py-2 text-center text-xs tracking-tight text-brand-black hover:border-brand-tan hover:bg-brand-tan hover:text-brand-black"
      >
        <span className="font-semibold">Sunday Services</span>
        <span className="font-normal">9:15a + 11a</span>
      </Link>
      <Link
        href="https://instagram.com/freedomhouselkn"
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-1.5 rounded border-0 px-2 py-1.5 text-xs font-semibold tracking-tight text-white shadow-sm transition-[filter] hover:brightness-110 [background:linear-gradient(135deg,#Ffd600,#ff7a00,#ff0069,#d300c5,#7638fa)]"
      >
        <Instagram className="h-3.5 w-3.5 shrink-0" aria-hidden />
        @freedomhouselkn
      </Link>
    </div>
  ),
  "Ballantyne Campus": (
    <div className="grid w-max max-w-full grid-cols-1 gap-2 text-center">
      <Link
        href="https://www.google.com/maps/search/?api=1&query=1041+Red+Ventures+Drive+Fort+Mill+SC+29707"
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full flex-col items-center justify-center rounded border border-brand-black/20 bg-brand-white px-3 py-2 text-xs font-semibold tracking-tight text-brand-black hover:border-brand-tan hover:bg-brand-tan hover:text-brand-black"
      >
        <span>1041 Red Ventures Drive</span>
        <span>Fort Mill SC 29707</span>
      </Link>
      <Link
        href="#"
        className="flex w-full flex-col items-center justify-center rounded border border-brand-black/20 bg-brand-white px-3 py-2 text-center text-xs tracking-tight text-brand-black hover:border-brand-tan hover:bg-brand-tan hover:text-brand-black"
      >
        <span className="font-semibold">Sunday Services</span>
        <span className="font-normal">9:15a + 11a</span>
      </Link>
      <Link
        href="https://instagram.com/freedomhouseballantyne"
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-1.5 rounded border-0 px-2 py-1.5 text-xs font-semibold tracking-tight text-white shadow-sm transition-[filter] hover:brightness-110 [background:linear-gradient(135deg,#Ffd600,#ff7a00,#ff0069,#d300c5,#7638fa)]"
      >
        <Instagram className="h-3.5 w-3.5 shrink-0" aria-hidden />
        @freedomhouseballantyne
      </Link>
      <Link
        href="#"
        className="flex w-full items-center justify-center rounded border border-brand-black/20 bg-emerald-600 px-3 py-2 text-xs font-semibold tracking-tight text-brand-white hover:bg-emerald-500"
      >
        Learn more
      </Link>
    </div>
  ),
  "Online Campus": (
    <div className="grid w-max max-w-full grid-cols-1 gap-2 text-center">
      <Link
        href="https://freedomhouse.cc/live"
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full flex-col items-center justify-center rounded border border-brand-black/20 bg-brand-white px-3 py-2 text-xs font-semibold tracking-tight text-brand-black hover:border-brand-tan hover:bg-brand-tan hover:text-brand-black"
      >
        <span>Watch live at</span>
        <span>FreedomHouse.cc/live</span>
      </Link>
      <Link
        href="#"
        className="flex w-full flex-col items-center justify-center rounded border border-brand-black/20 bg-brand-white px-3 py-2 text-center text-xs tracking-tight text-brand-black hover:border-brand-tan hover:bg-brand-tan hover:text-brand-black"
      >
        <span className="font-semibold">Sunday Services</span>
        <span className="font-normal">9:15a + 11a</span>
      </Link>
    </div>
  ),
};

const COLUMNS = [
  {
    title: "Join us.",
    icon: MapPin,
    image: "/home/join-us.jpg",
    items: [
      "Central Campus",
      "South End Campus",
      "Lake Norman Campus",
      "Ballantyne Campus",
      "Online Campus",
    ],
  },
  {
    title: "Learn about us.",
    icon: BookOpen,
    image: "/home/learn-about-us.jpg",
    items: [
      "Vision + Beliefs",
      "Become a Member",
      "Kids + Students + Young Adults",
      "Upcoming Events",
    ],
  },
  {
    title: "Connect with us.",
    icon: Users,
    image: "/home/connect-with-us.jpg",
    items: [
      "Find Your Community",
      "Strong Men",
      "Authentic Women",
      "Get Involved",
    ],
  },
] as const;

export default function HomeTanSection() {
  /** One open item key per column (column title -> item key). */
  const [openByColumn, setOpenByColumn] = useState<Record<string, string | null>>({});

  function toggle(columnTitle: string, key: string) {
    setOpenByColumn((prev) => ({
      ...prev,
      [columnTitle]: prev[columnTitle] === key ? null : key,
    }));
  }

  return (
    <section className="bg-brand-tan px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const Icon = col.icon;
            return (
              <article
                key={col.title}
                className="overflow-hidden rounded-3xl border border-brand-black bg-brand-white shadow-lg transition-transform duration-200 hover:scale-105"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={col.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="px-5 py-4">
                  <h2 className="mb-3 flex items-center justify-between gap-2 text-xl font-bold tracking-tight text-brand-black leading-[1.25rem]">
                    <span>{col.title}</span>
                    <Icon className="h-6 w-6 shrink-0" aria-hidden />
                  </h2>
                  <ul className="divide-y divide-brand-black/10">
                    {col.items.map((item) => {
                      const key = `${col.title}-${item}`;
                      const isOpen = openByColumn[col.title] === key;
                      return (
                        <li key={item}>
                          <div
                            className={isOpen ? "bg-brand-tan/50 -mx-5 px-5" : ""}
                          >
                            <button
                              type="button"
                              onClick={() => toggle(col.title, key)}
                              className="flex w-full items-center justify-between gap-2 py-2 text-left text-sm font-medium tracking-tight text-brand-black hover:text-brand-tan leading-[0.875rem]"
                            >
                              <span className="font-semibold">{item}</span>
                              <span className="flex shrink-0 items-center gap-2">
                                {item === "Ballantyne Campus" && (
                                  <span className="rounded-full bg-brand-tan px-2 py-0.5 text-xs font-semibold tracking-tight text-brand-black/90">
                                    Coming Soon!
                                  </span>
                                )}
                                <span
                                  className={`transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                                  aria-hidden
                                >
                                  <Plus className="h-4 w-4" />
                                </span>
                              </span>
                            </button>
                            <div
                              className={`grid transition-[grid-template-rows] duration-200 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                            >
                              <div className="min-h-0 overflow-hidden">
                                <div className="flex justify-center border-t border-brand-black/10 py-2">
                                  {col.title === "Join us." && JOIN_US_CONTENT[item] ? (
                                    JOIN_US_CONTENT[item]
                                  ) : (
                                    <p className="text-xs tracking-tight text-brand-black/80">
                                      Placeholder content for {item}.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
