import { Mail, Phone, Instagram, Facebook, MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/constants";

const contactChannels = [
  {
    icon: Mail,
    label: "Email",
    value: siteConfig.contact.email,
    href: `mailto:${siteConfig.contact.email}`,
  },
  {
    icon: Phone,
    label: "Phone",
    value: siteConfig.contact.phone,
    href: `tel:${siteConfig.contact.phone.replace(/\s+/g, "")}`,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Chat with a ride captain",
    href: siteConfig.links.whatsapp,
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: "@royalnomadriders",
    href: siteConfig.links.instagram,
  },
  {
    icon: Facebook,
    label: "Facebook",
    value: "Royal Nomad Riders Club",
    href: siteConfig.links.facebook,
  },
];

export function ContactInfo() {
  return (
    <div className="flex flex-col gap-4">
      {contactChannels.map((channel) => {
        const Icon = channel.icon;
        return (
          <a
            key={channel.label}
            href={channel.href}
            target={channel.href.startsWith("http") ? "_blank" : undefined}
            rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="group flex items-center gap-4 rounded-lg border border-nomad-steel bg-nomad-charcoal p-4 transition-colors hover:border-nomad-red"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-nomad-red/10 text-nomad-red">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-nomad-ash">
                {channel.label}
              </p>
              <p className="truncate text-sm font-medium text-nomad-white group-hover:text-nomad-red">
                {channel.value}
              </p>
            </div>
          </a>
        );
      })}
    </div>
  );
}
