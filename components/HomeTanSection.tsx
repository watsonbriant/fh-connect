"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  COLUMNS,
  JOIN_US_CONTENT,
  LEARN_ABOUT_US_CONTENT,
  CONNECT_WITH_US_CONTENT,
} from "@/content/homeTanSection";

function getExpandableContent(
  columnTitle: string,
  item: string
): React.ReactNode {
  if (columnTitle === "Join us." && item in JOIN_US_CONTENT) {
    return JOIN_US_CONTENT[item];
  }
  if (columnTitle === "Learn about us." && item in LEARN_ABOUT_US_CONTENT) {
    return LEARN_ABOUT_US_CONTENT[item];
  }
  if (columnTitle === "Connect with us." && item in CONNECT_WITH_US_CONTENT) {
    return CONNECT_WITH_US_CONTENT[item];
  }
  return (
    <p className="text-xs tracking-tight text-brand-black/80">
      Placeholder content for {item}.
    </p>
  );
}

export default function HomeTanSection() {
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
                  <h2 className="mb-3 flex items-center justify-between gap-2 text-xl font-bold leading-[1.25rem] tracking-tight text-brand-black">
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
                              className="flex w-full items-center justify-between gap-2 py-2 text-left text-sm font-medium leading-[0.875rem] tracking-tight text-brand-black hover:text-brand-tan"
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
                                  {getExpandableContent(col.title, item)}
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
