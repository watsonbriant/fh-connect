export const SECTIONS = ["Account", "Profile", "Giving", "Groups", "Serving"] as const;
export type Section = (typeof SECTIONS)[number];
export const SECTION_SLUGS = SECTIONS.map((s) => s.toLowerCase());

export const SECTION_HEADERS: Record<Section, string> = {
  Account: "Account Settings",
  Profile: "Profile Information",
  Giving: "My Giving",
  Groups: "My Groups",
  Serving: "My Serves",
};

export function sectionFromSlug(slug: string | undefined): Section {
  if (!slug) return "Account";
  const i = SECTION_SLUGS.indexOf(slug);
  return i >= 0 ? SECTIONS[i] : "Account";
}
