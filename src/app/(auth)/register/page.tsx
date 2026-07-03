import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = buildMetadata({
  title: "Create Account",
  description: "Join Royal Nomad Riders Club and register for upcoming rides.",
  path: "/register",
  noIndex: true,
});

export default function RegisterPage() {
  return <RegisterForm />;
}
