import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-nomad-steel bg-nomad-charcoal/40 px-6 py-16 text-center",
        className
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-nomad-steel/40">
        <Icon className="h-6 w-6 text-nomad-red" aria-hidden="true" />
      </span>
      <h3 className="font-display text-lg font-semibold text-nomad-white">{title}</h3>
      <p className="max-w-sm text-sm text-nomad-ash">{description}</p>
    </div>
  );
}
