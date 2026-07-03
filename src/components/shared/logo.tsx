import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/constants";

interface LogoProps {
  className?: string;
  variant?: "full" | "mark";
}

export function Logo({ className, variant = "full" }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group flex items-center gap-2.5 font-display font-bold tracking-tight text-nomad-white",
        className
      )}
      aria-label={`${siteConfig.name} home`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-nomad-red bg-nomad-black text-sm font-black italic text-nomad-red transition-transform duration-300 group-hover:rotate-[-8deg]">
        RN
      </span>
      {variant === "full" && (
        <span className="flex flex-col leading-none">
          <span className="text-base sm:text-lg">ROYAL NOMAD</span>
          <span className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-nomad-red">
            Riders Club
          </span>
        </span>
      )}
    </Link>
  );
}
