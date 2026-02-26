export const SECTIONS = ["Profile", "Giving", "Groups", "Serving", "Account"] as const;
export type Section = (typeof SECTIONS)[number];
export const SECTION_SLUGS = SECTIONS.map((s) => s.toLowerCase());

/** Labels shown in the section pill selector (and mobile menu). */
export const SECTION_TAB_LABELS: Record<Section, string> = {
  Profile: "Profile",
  Giving: "Giving",
  Groups: "Groups",
  Serving: "Serving",
  Account: "Account Settings",
};

export const SECTION_HEADERS: Record<Section, string> = {
  Account: "Account Settings",
  Profile: "Profile Information",
  Giving: "My Giving",
  Groups: "My Groups",
  Serving: "My Serves",
};

export function sectionFromSlug(slug: string | undefined): Section {
  if (!slug) return "Profile";
  const i = SECTION_SLUGS.indexOf(slug);
  return i >= 0 ? SECTIONS[i] : "Profile";
}
