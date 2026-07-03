import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = buildMetadata({
  title: "Reset Password",
  description: "Request a password reset link for your Royal Nomad Riders Club account.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
