"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerAction } from "../actions";

export function RegisterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterInput) {
    setIsSubmitting(true);
    setFormError(null);

    const result = await registerAction(values);

    if (!result.success) {
      setFormError(result.error);
      setIsSubmitting(false);
      return;
    }

    if (result.data.requiresEmailConfirmation) {
      setNeedsConfirmation(true);
      setIsSubmitting(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  if (needsConfirmation) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <MailCheck className="h-10 w-10 text-nomad-gold" aria-hidden="true" />
        <h1 className="font-display text-xl font-bold text-nomad-white">Check your inbox</h1>
        <p className="text-sm text-nomad-ash">
          We&apos;ve sent a confirmation link to your email. Click it to activate your account and sign in.
        </p>
        <Button asChild variant="outline" className="mt-2">
          <Link href="/login">Back to Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-nomad-white">Join the Club</h1>
        <p className="mt-1 text-sm text-nomad-ash">Create your rider account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {formError && (
          <div
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-red-400"
          >
            {formError}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Rahul Verma"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-nomad-ash">
        Already a member?{" "}
        <Link href="/login" className="font-medium text-nomad-gold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
