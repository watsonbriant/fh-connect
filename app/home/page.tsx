export default function Home() {
  return (
    <main className="relative min-h-screen">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden
      >
        <source src="/Homepage.mp4" type="video/mp4" />
      </video>
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome
        </h1>
        <p className="mt-2 text-white/80 tracking-tight">
          Content will go here. The top bar stays visible on every page.
        </p>
      </div>
    </main>
  );
}
