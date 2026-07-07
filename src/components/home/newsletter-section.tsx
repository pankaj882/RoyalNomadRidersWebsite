"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatedContainer } from "@/components/shared/animated-container";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setStatus("error");
        setMessage(result.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(result.message ?? "You're subscribed!");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <section className="relative overflow-hidden bg-nomad-gold py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, #000 0, #000 1px, transparent 1px, transparent 14px)",
        }}
        aria-hidden="true"
      />
      <div className="container relative">
        <AnimatedContainer className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-nomad-black/15">
            <Mail className="h-6 w-6 text-nomad-black" />
          </span>
          <h2 className="font-display text-3xl font-bold text-nomad-black sm:text-4xl">
            Never Miss A Ride
          </h2>
          <p className="text-sm text-nomad-black/80 sm:text-base">
            Trip announcements, gear tips, and ride reports — straight to your inbox. No spam,
            unsubscribe anytime.
          </p>

          <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
              className="h-12 border-nomad-black/30 bg-nomad-black/10 text-nomad-black placeholder:text-nomad-black/60 focus-visible:ring-nomad-black"
            />
            <Button
              type="submit"
              size="lg"
              disabled={status === "loading"}
              className="bg-nomad-black text-white hover:bg-nomad-black/80"
            >
              {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
              Subscribe
            </Button>
          </form>
          {message && (
            <p role="status" className="text-sm text-nomad-black/90">
              {message}
            </p>
          )}
        </AnimatedContainer>
      </div>
    </section>
  );
}
