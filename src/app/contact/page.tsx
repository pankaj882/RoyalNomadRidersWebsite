import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactInfo } from "@/components/contact/contact-info";
import { MapEmbed } from "@/components/contact/map-embed";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata, buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us",
  description: `Get in touch with ${siteConfig.name} — questions about rides, membership, or partnerships.`,
  path: "/contact",
});

export default function ContactPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />

      <section className="border-b border-nomad-steel bg-nomad-charcoal py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            as="h1"
            eyebrow="Get In Touch"
            title="Contact The Club"
            description="Questions about an upcoming ride, joining the club, or partnering with us? Reach out — a ride captain reads every message."
          />
        </div>
      </section>

      <section className="bg-nomad-black py-16 sm:py-24">
        <div className="container grid grid-cols-1 gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-xl border border-nomad-steel bg-nomad-charcoal p-6 sm:p-10">
            <ContactForm />
          </div>

          <div className="flex flex-col gap-8">
            <ContactInfo />
            <MapEmbed />
          </div>
        </div>
      </section>
    </>
  );
}
