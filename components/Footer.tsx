import Link from "next/link";
import Image from "next/image";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
  SpotifyIcon,
  ApplePodcastsIcon,
} from "@/components/SocialIcons";

const SOCIAL_LINKS = [
  { href: "https://facebook.com/freedomhousech", Icon: FacebookIcon, label: "Facebook" },
  { href: "https://instagram.com/freedomhouse", Icon: InstagramIcon, label: "Instagram" },
  { href: "https://www.tiktok.com/@freedomhousech?lang=en", Icon: TikTokIcon, label: "TikTok" },
  { href: "https://www.youtube.com/@FreedomhouseCc", Icon: YouTubeIcon, label: "YouTube" },
  { href: "https://open.spotify.com/show/4PGTy7JELRr7d9WcT4bHpA?si=3509ce5c96334991", Icon: SpotifyIcon, label: "Spotify" },
  { href: "https://podcasts.apple.com/us/podcast/freedom-house-church/id1397424886", Icon: ApplePodcastsIcon, label: "Apple Podcasts" },
] as const;

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Give", href: "#" },
  { label: "FHConnect", href: "https://www.freedomhouse.cc/fhconnect" },
  { label: "Freedom Academy", href: "https://freedomacademync.cc" },
] as const;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="w-full border-t border-white/10 bg-[#0a0a0a] text-brand-white"
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
          {/* Logo and primary links */}
          <div className="flex flex-col items-center gap-4 md:items-start">
            <Link href="/" className="shrink-0" aria-label="Freedom House home">
              <Image
                src="/logo-white.png"
                alt=""
                width={140}
                height={44}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm tracking-tight md:justify-start" aria-label="Footer">
              {FOOTER_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="text-brand-white/90 hover:text-brand-tan"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social links */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {SOCIAL_LINKS.map(({ href, Icon, label }) => (
              <Link
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-black/20 bg-brand-white text-brand-black transition-transform hover:scale-105 hover:bg-brand-tan hover:border-brand-black/40"
                aria-label={label}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-brand-white/70">
          <p>© {currentYear} Freedom House. All rights reserved.</p>
          <p className="mt-1 text-xs">
            Powered by{" "}
            <Link
              href="https://xyzsolutions.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-white/90 underline hover:text-brand-tan font-bold"
            >
              an [xyz] solution
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
