import Link from "next/link";
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Separator } from "@/components/ui/separator";
import { siteConfig, footerNavLinks } from "@/lib/constants";
import { NewsletterForm } from "@/components/shared/newsletter-form";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-nomad-steel bg-nomad-black">
      <div className="container py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm text-nomad-ash">{siteConfig.description}</p>
            <div className="flex items-center gap-3 pt-2">
              <SocialIcon href={siteConfig.links.instagram} label="Instagram">
                <Instagram className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href={siteConfig.links.facebook} label="Facebook">
                <Facebook className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href={siteConfig.links.youtube} label="YouTube">
                <Youtube className="h-4 w-4" />
              </SocialIcon>
            </div>
          </div>

          <FooterColumn title="Club" links={footerNavLinks.club} />
          <FooterColumn title="Explore" links={footerNavLinks.explore} />
          <FooterColumn title="Legal" links={footerNavLinks.legal} />

          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-nomad-fog">
              Ride Updates
            </h4>
            <p className="text-sm text-nomad-ash">
              Get new ride announcements and trip reports in your inbox.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col gap-4 text-sm text-nomad-ash sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {siteConfig.contact.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> {siteConfig.contact.phone}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> India
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-nomad-fog">{title}</h4>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-nomad-ash transition-colors hover:text-nomad-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-nomad-steel text-nomad-fog transition-colors hover:border-nomad-red hover:text-nomad-red"
    >
      {children}
    </a>
  );
}
