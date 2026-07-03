import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-nomad-black px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(200,30,44,0.12),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(200,30,44,0.08),transparent_45%)]"
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-xl border border-nomad-steel bg-nomad-charcoal/80 p-8 shadow-2xl backdrop-blur-sm">
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-nomad-ash">
          <Link href="/" className="underline decoration-nomad-steel underline-offset-4 hover:text-nomad-fog">
            ← Back to Royal Nomad Riders Club
          </Link>
        </p>
      </div>
    </div>
  );
}
