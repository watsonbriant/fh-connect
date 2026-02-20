import Link from "next/link";
import { getStoragePublicUrl } from "@/lib/supabase";
import HomeTanSection from "@/components/HomeTanSection";

export default function Home() {
  const bucket = process.env.NEXT_PUBLIC_HOMEPAGE_VIDEO_BUCKET;
  const path = process.env.NEXT_PUBLIC_HOMEPAGE_VIDEO_PATH;
  const videoSrc =
    bucket && path
      ? getStoragePublicUrl(bucket, path)
      : process.env.NEXT_PUBLIC_HOMEPAGE_VIDEO_URL ?? "/Homepage.mp4";

  return (
    <main>
      <section className="relative h-screen w-full overflow-hidden md:h-[960px]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
          aria-hidden
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-4">
          <h1 className="text-center">
            <span className="block text-6xl font-bold tracking-tight text-white">
              Welcome
            </span>
            <span className="block text-6xl font-bold">
              <span className="tracking-tight text-brand-tan">HOME</span>
              <span className="tracking-tight text-white">.</span>
            </span>
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="#"
              className="rounded-lg bg-brand-white px-6 py-3 text-base font-semibold tracking-tight text-brand-black hover:bg-white/90"
            >
              Service Times
            </Link>
            <Link
              href="#"
              className="rounded-lg bg-brand-white px-6 py-3 text-base font-semibold tracking-tight text-brand-black hover:bg-white/90"
            >
              I'm New!
            </Link>
          </div>
        </div>
      </section>

      {/* Black section — vision */}
      <section className="bg-[#0a0a0a] px-4 py-8 sm:px-6 lg:px-8">
        <p className="mx-auto max-w-[560px] font-bold text-center text-xl tracking-tight text-white sm:text-2xl leading-[1.125rem] sm:leading-[1.375rem]">
          Our vision at Freedom House is to equip people to experience Christ's{" "}
          <span className="text-brand-tan">freedom</span> in their everyday lives.
        </p>
      </section>

      <HomeTanSection />
    </main>
  );
}
