import { Star, Quote, MessageSquareOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/shared/section-heading";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { EmptyState } from "@/components/shared/empty-state";
import { getFeaturedTestimonials } from "@/lib/data/home";
import { getInitials } from "@/lib/utils";

export async function TestimonialsSection() {
  const testimonials = await getFeaturedTestimonials(6);

  return (
    <section className="bg-nomad-charcoal py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Rider Voices"
          title="What The Club Says"
          align="center"
          className="mb-12"
        />

        {testimonials.length === 0 ? (
          <EmptyState
            icon={MessageSquareOff}
            title="No Testimonials Yet"
            description="Rider shout-outs and reviews from the community will be featured here."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <AnimatedContainer
                key={testimonial.id}
                delay={index * 0.08}
                className="flex flex-col gap-4 rounded-lg border border-nomad-steel bg-nomad-black p-6"
              >
                <Quote className="h-6 w-6 text-nomad-gold/60" aria-hidden="true" />
                <p className="flex-1 text-sm text-nomad-fog">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-0.5" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < testimonial.rating ? "fill-nomad-gold text-nomad-gold" : "text-nomad-steel"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Avatar className="h-10 w-10">
                    {testimonial.authorAvatarUrl && (
                      <AvatarImage src={testimonial.authorAvatarUrl} alt={testimonial.authorName} />
                    )}
                    <AvatarFallback>{getInitials(testimonial.authorName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-nomad-white">{testimonial.authorName}</p>
                    {testimonial.authorTitle && (
                      <p className="text-xs text-nomad-ash">{testimonial.authorTitle}</p>
                    )}
                  </div>
                </div>
              </AnimatedContainer>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
