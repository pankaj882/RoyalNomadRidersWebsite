"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations/auth";
import type { ActionResult } from "@/types";
import { clientEnv } from "@/lib/env";

export async function loginAction(input: LoginInput): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      error:
        error.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : error.message,
    };
  }

  revalidatePath("/", "layout");
  return { success: true, data: { redirectTo: "/admin" } };
}

export async function registerAction(input: RegisterInput): Promise<ActionResult<{ requiresEmailConfirmation: boolean }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${clientEnv.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return {
      success: false,
      error:
        error.message === "User already registered"
          ? "An account with this email already exists."
          : error.message,
    };
  }

  if (!data.user) {
    return { success: false, error: "Something went wrong creating your account. Please try again." };
  }

  // Mirror the profile into our Prisma-managed `users` table. Default role
  // is MEMBER — elevation to Admin/Blog Author happens via the admin panel.
  await prisma.user.upsert({
    where: { id: data.user.id },
    create: {
      id: data.user.id,
      email: data.user.email!,
      name,
      role: "MEMBER",
    },
    update: { name },
  });

  const requiresEmailConfirmation = !data.session;
  revalidatePath("/", "layout");

  return { success: true, data: { requiresEmailConfirmation } };
}

export async function updatePasswordAction(
  input: ResetPasswordInput
): Promise<ActionResult<undefined>> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, data: undefined, message: "Password updated. You can now sign in." };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function forgotPasswordAction(
  input: ForgotPasswordInput
): Promise<ActionResult<undefined>> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please enter a valid email address.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${clientEnv.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  // Intentionally return success even if the email isn't found, to avoid
  // leaking which addresses have accounts (standard auth UX practice).
  if (error) {
    console.error("forgotPasswordAction error:", error.message);
  }

  return { success: true, data: undefined, message: "If an account exists for that email, a reset link is on its way." };
}
