import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = buildMetadata({
  title: "Admin Login",
  description: "Sign in to the Royal Nomad Riders Club admin dashboard.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return <LoginForm />;
}
