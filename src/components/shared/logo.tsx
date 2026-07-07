import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/constants";

interface LogoProps {
  className?: string;
  variant?: "full" | "mark";
  /** Pixel size of the badge image. Defaults per variant if omitted. */
  size?: number;
}

export function Logo({ className, variant = "full", size }: LogoProps) {
  const badgeSize = size ?? (variant === "mark" ? 40 : 44);

  return (
    <Link
      href="/"
      className={cn(
        "group flex items-center gap-2.5 font-display font-bold tracking-tight text-nomad-white",
        className
      )}
      aria-label={`${siteConfig.name} home`}
    >
      <span
        className="relative shrink-0 transition-transform duration-300 group-hover:rotate-[-6deg]"
        style={{ width: badgeSize, height: badgeSize }}
      >
        <Image
          src="/brand/logo.png"
          alt=""
          fill
          sizes={`${badgeSize}px`}
          className="object-contain"
          priority
        />
      </span>
      {variant === "full" && (
        <span className="flex flex-col leading-none">
          <span className="text-base sm:text-lg">ROYAL NOMAD</span>
          <span className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-nomad-gold">
            Riders Club
          </span>
        </span>
      )}
    </Link>
  );
}
