"use client";

import { MapPin, BookOpen, Users, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const COLUMNS = [
  {
    title: "Join us.",
    icon: MapPin,
    image: "/home/join-us.jpg",
    items: [
      "Central Campus",
      "South End Campus",
      "Lake Norman Campus",
      "Ballantyne/Ft. Mill Campus",
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
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({});

  function toggle(key: string) {
    setOpenKeys((prev) => ({ ...prev, [key]: !prev[key] }));
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
                  <h2 className="mb-3 flex items-center justify-between gap-2 text-xl font-bold tracking-tight text-brand-black">
                    <span>{col.title}</span>
                    <Icon className="h-6 w-6 shrink-0" aria-hidden />
                  </h2>
                  <ul className="divide-y divide-brand-black/10">
                    {col.items.map((item) => {
                      const key = `${col.title}-${item}`;
                      const isOpen = openKeys[key];
                      return (
                        <li key={item}>
                          <div
                            className={isOpen ? "bg-brand-tan/50 -mx-5 px-5" : ""}
                          >
                            <button
                              type="button"
                              onClick={() => toggle(key)}
                              className="flex w-full items-center justify-between gap-2 py-2 text-left text-sm font-medium tracking-tight text-brand-black hover:text-brand-tan"
                            >
                              <span className="font-semibold">{item}</span>
                              <span
                                className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                                aria-hidden
                              >
                                <Plus className="h-4 w-4" />
                              </span>
                            </button>
                            <div
                              className={`grid transition-[grid-template-rows] duration-200 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                            >
                              <div className="min-h-0 overflow-hidden">
                                <div className="border-t border-brand-black/5 pb-3 pt-1">
                                  <p className="text-sm tracking-tight text-brand-black/80">
                                    Placeholder content for {item}.
                                  </p>
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
