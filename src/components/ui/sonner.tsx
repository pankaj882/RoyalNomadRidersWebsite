"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-nomad-charcoal group-[.toaster]:text-foreground group-[.toaster]:border-nomad-steel group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-nomad-ash",
          actionButton: "group-[.toast]:bg-nomad-red group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-nomad-steel group-[.toast]:text-nomad-fog",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
