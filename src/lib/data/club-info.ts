import { Shield, HeartPulse, Wrench, Users2, CloudRain, Route } from "lucide-react";
import { siteConfig } from "@/lib/constants";

export const historyParagraphs: string[] = [
  `${siteConfig.name} started in ${siteConfig.founded} as a handful of riders who kept running into each other at the same highway dhabas on weekend runs out of the city. What began as informal Sunday breakfast rides slowly turned into planned monthly expeditions — first to the nearby hills, then further out to the coast, and eventually into the high Himalayas.`,
  `We're not a dealership-branded riding group and we're not a stunt crew. We're a community built around one idea: the best way to see this country is on two wheels, with people who'll stop when your chain snaps at 2am on a mountain pass. Over the years that idea has taken us through monsoon coastal runs, winter desert crossings, and more Ladakh trips than anyone can count.`,
  `Today the club is run by riders, for riders — every ride captain, every route, every safety briefing comes from someone who has actually ridden that road before. No sponsorships dictating our routes, no membership fees gatekeeping the community. Just a shared respect for the ride and the people doing it alongside you.`,
];

export const missionStatement =
  "To build and support a community of riders who explore India's mountains, coastlines, and back-roads responsibly — prioritizing safety, environmental respect, and genuine camaraderie over ego or speed.";

export const visionStatement =
  "A riding culture where every route is ridden with care for the terrain, the local communities along the way, and the rider beside you — where adventure and responsibility aren't in tension, they're the same thing.";

export interface SafetyGuideline {
  icon: typeof Shield;
  title: string;
  description: string;
}

export const safetyGuidelines: SafetyGuideline[] = [
  {
    icon: Shield,
    title: "Full Gear, Every Ride",
    description:
      "Helmet, jacket, gloves, and boots are non-negotiable on every club ride, regardless of distance or difficulty. Knee guards are strongly recommended for off-road and mountain routes.",
  },
  {
    icon: Route,
    title: "Ride Within Your Limits",
    description:
      "Ride captains set the pace based on the group's least experienced rider. Overtaking the lead rider or breaking formation on technical sections isn't tolerated.",
  },
  {
    icon: HeartPulse,
    title: "Declare Medical Info",
    description:
      "Every registration includes blood group, allergies, and emergency contact details. This isn't optional paperwork — it's what lets us act fast if something goes wrong far from a hospital.",
  },
  {
    icon: Wrench,
    title: "Pre-Ride Mechanical Check",
    description:
      "Tyres, brakes, chain, and fluid levels get checked before every ride departs. A breakdown on a mountain road is a safety issue, not just an inconvenience.",
  },
  {
    icon: CloudRain,
    title: "Weather Overrides Plans",
    description:
      "Ride captains have full authority to delay, reroute, or cancel a leg based on weather or road conditions — no route is worth an unnecessary risk.",
  },
  {
    icon: Users2,
    title: "No Rider Left Behind",
    description:
      "The group moves at the pace of the slowest rider. Sweep riders close every formation, and nobody continues alone past a designated regroup point.",
  },
];

export interface TimelineMilestone {
  year: string;
  title: string;
  description: string;
}

export const timelineMilestones: TimelineMilestone[] = [
  {
    year: String(siteConfig.founded),
    title: "The First Ride",
    description: "A dozen riders on a weekend breakfast run becomes a standing monthly meetup.",
  },
  {
    year: String(siteConfig.founded + 1),
    title: "First Mountain Expedition",
    description: "The club's first multi-day trip into the Himalayas — a route we still ride every season.",
  },
  {
    year: String(siteConfig.founded + 2),
    title: "Safety Protocol Established",
    description: "Formal ride-captain system, mandatory gear checks, and medical registration introduced club-wide.",
  },
  {
    year: String(siteConfig.founded + 3),
    title: "100+ Registered Riders",
    description: "The community crosses its first major membership milestone.",
  },
  {
    year: String(siteConfig.founded + 4),
    title: "Coastal & Off-Road Chapters",
    description: "Dedicated sub-groups form for coastal touring and technical off-road riding.",
  },
  {
    year: "Today",
    title: "Still On The Road",
    description: "Monthly rides, seasonal expeditions, and a community that keeps growing one route at a time.",
  },
];
