"use client";

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

export default function StayConnectedSection() {
  return (
    <section className="relative w-full overflow-hidden bg-brand-black">
      <div className="absolute inset-0">
        <Image
          src="/home/stay-connected.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority={false}
        />
        <div className="absolute inset-0 bg-brand-black/50" aria-hidden />
      </div>

      <div className="relative flex flex-col items-center justify-center gap-8 px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Stay connected.
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {SOCIAL_LINKS.map(({ href, Icon, label }) => (
            <Link
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-brand-black/20 bg-brand-white text-brand-black transition-transform hover:scale-105 hover:border-brand-black/40"
              aria-label={label}
            >
              <Icon className="h-6 w-6" aria-hidden />
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="https://www.freedomhouse.cc/fhconnect"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-brand-white px-6 py-3 text-base font-semibold tracking-tight text-brand-black hover:bg-white/90"
          >
            FHConnect
          </Link>
          <Link
            href="https://qrco.de/bcogWo"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-brand-white px-6 py-3 text-base font-semibold tracking-tight text-brand-black hover:bg-white/90"
          >
            Download the App
          </Link>
        </div>
      </div>
    </section>
  );
}
