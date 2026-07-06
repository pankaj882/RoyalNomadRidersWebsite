/**
 * Core Members displayed on the About page.
 *
 * TODO (production data): every entry below is placeholder content. Replace
 * `name`, `designation`, `description`, `instagramHandle`, and `photoUrl`
 * with real club member details before launch. `photoUrl` currently points
 * to a generated initials avatar (ui-avatars.com) purely as an obvious,
 * honest placeholder — swap in a real uploaded photo per member (e.g. a
 * Supabase Storage URL, following the same pattern as gallery/blog/event
 * images) when real data is available.
 *
 * This lives as a plain constants array — deliberately not wired to the
 * database — so it renders immediately with zero setup. A parallel,
 * admin-manageable alternative already exists in the codebase if you'd
 * rather let non-technical admins manage this from the dashboard instead of
 * editing code: `User.isFounder` / `founderTitle` / `displayOrder` (see
 * `src/lib/data/about.ts`'s `getCoreMembers()` and the "About Page Display"
 * dialog on `/admin/users`, built in Phase 6). Swapping this section back to
 * that data source later is a one-line change in `core-members-section.tsx`.
 */

export interface TeamMember {
  id: string;
  name: string;
  designation: string;
  description: string;
  /** Without the leading @ */
  instagramHandle: string;
  photoUrl: string;
}

function placeholderAvatar(name: string): string {
  const initials = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${initials}&background=2A2C30&color=E32636&size=256&font-size=0.38&bold=true`;
}

export const teamMembers: TeamMember[] = [
  {
    id: "president",
    name: "John Doe",
    designation: "President & Founder",
    description:
      "Founded the club in 2018 after one too many solo breakfast rides. Still leads the annual Ladakh expedition personally.",
    instagramHandle: "johnrides",
    photoUrl: placeholderAvatar("John Doe"),
  },
  {
    id: "ride-captain",
    name: "Aditya Rao",
    designation: "Head Ride Captain",
    description:
      "Plans every club route and sets the pace on mountain rides. Has ridden every major Himalayan pass at least twice.",
    instagramHandle: "aditya.rides",
    photoUrl: placeholderAvatar("Aditya Rao"),
  },
  {
    id: "offroad-lead",
    name: "Priya Nair",
    designation: "Off-Road Lead",
    description:
      "Runs the technical trail and off-road sessions, and teaches new riders how to handle loose gravel and river crossings.",
    instagramHandle: "priya.offroad",
    photoUrl: placeholderAvatar("Priya Nair"),
  },
  {
    id: "events-coordinator",
    name: "Karan Mehta",
    designation: "Events Coordinator",
    description:
      "Handles ride logistics end to end — permits, stay arrangements, and making sure everyone actually shows up on time.",
    instagramHandle: "karan.onwheels",
    photoUrl: placeholderAvatar("Karan Mehta"),
  },
  {
    id: "safety-officer",
    name: "Sana Sheikh",
    designation: "Safety Officer",
    description:
      "Runs the pre-ride gear checks and safety briefings. The reason the club has a mandatory-gear policy in the first place.",
    instagramHandle: "sana.safefirst",
    photoUrl: placeholderAvatar("Sana Sheikh"),
  },
  {
    id: "community-lead",
    name: "Vikram Singh",
    designation: "Community & Social Lead",
    description:
      "Runs the club's social media and welcomes every new rider personally at their first meetup.",
    instagramHandle: "vikram.wanders",
    photoUrl: placeholderAvatar("Vikram Singh"),
  },
];
