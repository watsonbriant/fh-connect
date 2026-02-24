import type { Metadata } from "next";

const SECTIONS = ["account", "profile", "giving", "groups", "serving"] as const;

function sectionLabel(slug: string | undefined): string {
  if (!slug) return "Account";
  const lower = slug.toLowerCase();
  const found = SECTIONS.find((s) => s === lower);
  if (!found) return "Account";
  return found.charAt(0).toUpperCase() + found.slice(1);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}): Promise<Metadata> {
  const { section } = await params;
  const slug = section?.[0];
  const label = sectionLabel(slug);
  return {
    title: `Freedom House — FHConnect / ${label}`,
  };
}

export default function FHConnectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
