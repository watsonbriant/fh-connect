"use client";

import { MapPin, BookOpen, Users, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const COLUMNS = [
  {
    title: "Join us.",
    icon: MapPin,
    image: "/home/join-us.png",
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
    image: "/home/learn-about-us.png",
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
    image: "/home/connect-with-us.png",
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
    <section className="bg-brand-tan px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const Icon = col.icon;
            return (
              <article
                key={col.title}
                className="overflow-hidden rounded-3xl border border-brand-black/10 bg-brand-white shadow-lg"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={col.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute bottom-3 left-3 rounded-lg bg-brand-black/70 p-2 text-brand-white">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                </div>
                <div className="px-5 py-4">
                  <h2 className="mb-3 text-xl font-bold tracking-tight text-brand-black">
                    {col.title}
                  </h2>
                  <ul className="divide-y divide-brand-black/10">
                    {col.items.map((item) => {
                      const key = `${col.title}-${item}`;
                      const isOpen = openKeys[key];
                      return (
                        <li key={item}>
                          <button
                            type="button"
                            onClick={() => toggle(key)}
                            className="flex w-full items-center justify-between gap-2 py-3 text-left text-sm font-medium tracking-tight text-brand-black hover:text-brand-tan"
                          >
                            <span>{item}</span>
                            <span
                              className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                              aria-hidden
                            >
                              <Plus className="h-4 w-4" />
                            </span>
                          </button>
                          {isOpen && (
                            <div className="overflow-hidden border-t border-brand-black/5 pb-3 pl-0 pr-4 pt-1">
                              <p className="text-sm tracking-tight text-brand-black/80">
                                Placeholder content for {item}.
                              </p>
                            </div>
                          )}
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
