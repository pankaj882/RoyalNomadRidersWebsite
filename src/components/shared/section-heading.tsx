import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  /**
   * Heading level to render. Defaults to `h2` since this component is
   * normally used for a section within a page that already has its own
   * `h1`. Pages whose hero/intro section IS the page's main heading (list
   * pages like /gallery, /blog, /events, /contact, which have no other h1)
   * must pass `as="h1"` — otherwise the page ships with zero `<h1>` tags,
   * which hurts both SEO and screen-reader navigation.
   */
  as?: "h1" | "h2";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  as = "h2",
}: SectionHeadingProps) {
  const HeadingTag = as;

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-nomad-gold">
          <span className="h-px w-6 bg-nomad-gold" aria-hidden="true" />
          {eyebrow}
        </span>
      )}
      <HeadingTag className="font-display text-3xl font-bold leading-[1.1] tracking-tight text-nomad-white sm:text-4xl lg:text-5xl">
        {title}
      </HeadingTag>
      {description && (
        <p className={cn("max-w-2xl text-base text-nomad-ash sm:text-lg", align === "center" && "mx-auto")}>
          {description}
        </p>
      )}
    </div>
  );
}
