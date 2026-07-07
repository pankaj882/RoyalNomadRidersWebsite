import { Users, Flag, Route, CalendarClock } from "lucide-react";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { getRideStats } from "@/lib/data/home";
import { formatNumber } from "@/lib/utils";

export async function RideStatsSection() {
  const stats = await getRideStats();

  const items = [
    { label: "Active Riders", value: formatNumber(stats.totalRiders), icon: Users },
    { label: "Rides Completed", value: formatNumber(stats.totalRides), icon: Flag },
    { label: "Kilometers Logged", value: formatNumber(stats.totalDistanceKm), icon: Route },
    { label: "Years On The Road", value: String(stats.yearsOnTheRoad), icon: CalendarClock },
  ];

  return (
    <section className="relative overflow-hidden border-y border-nomad-steel bg-nomad-black py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #C9A227 0, #C9A227 1px, transparent 1px, transparent 12px)",
        }}
        aria-hidden="true"
      />
      <div className="container relative">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <AnimatedContainer
                key={item.label}
                delay={index * 0.1}
                className="flex flex-col items-center gap-3 text-center"
              >
                <Icon className="h-6 w-6 text-nomad-gold" aria-hidden="true" />
                <span className="font-display text-4xl font-bold text-nomad-white sm:text-5xl">
                  {item.value}
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-nomad-ash">
                  {item.label}
                </span>
              </AnimatedContainer>
            );
          })}
        </div>
      </div>
    </section>
  );
}
