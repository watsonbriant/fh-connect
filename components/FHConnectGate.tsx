"use client";

import AuthModal from "@/components/AuthModal";

type FHConnectGateProps = {
  authModalOpen: boolean;
  onOpenAuthModal: () => void;
  onCloseAuthModal: () => void;
  onAuthChange: () => void | Promise<void>;
};

export default function FHConnectGate({
  authModalOpen,
  onOpenAuthModal,
  onCloseAuthModal,
  onAuthChange,
}: FHConnectGateProps) {
  return (
    <main className="min-h-screen bg-black-950 tracking-tight text-brand-white">
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-6 sm:px-6">
        <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight text-brand-white sm:text-3xl">
          FHConnect
        </h1>
        <div className="max-w-md rounded-3xl border border-brand-black bg-brand-white px-6 py-8 text-center text-brand-black shadow-lg">
          <h2 className="mb-3 text-xl font-bold tracking-tight text-brand-black">
            Sign in required
          </h2>
          <p className="mb-6 text-sm tracking-tight text-brand-black/80">
            You must be logged in to access FHConnect. Log in or create an account to continue.
          </p>
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="rounded bg-brand-black px-5 py-2.5 text-sm font-semibold tracking-tight text-brand-white hover:bg-brand-black/90"
          >
            Log in
          </button>
        </div>
      </div>
      <AuthModal
        isOpen={authModalOpen}
        onClose={onCloseAuthModal}
        onAuthChange={onAuthChange}
      />
    </main>
  );
}
