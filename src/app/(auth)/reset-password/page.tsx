import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = buildMetadata({
  title: "Set New Password",
  description: "Choose a new password for your Royal Nomad Riders Club account.",
  path: "/reset-password",
  noIndex: true,
});

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
