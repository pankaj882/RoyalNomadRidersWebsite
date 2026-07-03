"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { forgotPasswordAction } from "../actions";

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setIsSubmitting(true);
    await forgotPasswordAction(values);
    setIsSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <MailCheck className="h-10 w-10 text-nomad-red" aria-hidden="true" />
        <h1 className="font-display text-xl font-bold text-nomad-white">Check your inbox</h1>
        <p className="text-sm text-nomad-ash">
          If an account exists for that email, a password reset link is on its way.
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
        <h1 className="font-display text-2xl font-bold text-nomad-white">Forgot Password</h1>
        <p className="mt-1 text-sm text-nomad-ash">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
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

        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Send Reset Link
        </Button>
      </form>

      <p className="text-center text-sm text-nomad-ash">
        <Link href="/login" className="font-medium text-nomad-red hover:underline">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
