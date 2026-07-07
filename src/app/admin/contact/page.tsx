import type { Metadata } from "next";
import { MailOpen } from "lucide-react";
import { requireManagementAccess } from "@/lib/auth";
import { getAllContactSubmissions } from "@/lib/data/admin-contact";
import { ContactRow } from "@/components/admin/contact/contact-row";

export const metadata: Metadata = { title: "Contact Messages", robots: { index: false, follow: false } };

export default async function AdminContactPage() {
  await requireManagementAccess();
  const submissions = await getAllContactSubmissions();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-nomad-white">Contact Messages</h1>
        <p className="mt-1 text-sm text-nomad-ash">Messages submitted through the public contact form.</p>
      </div>

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-nomad-steel bg-nomad-charcoal/40 px-6 py-16 text-center">
          <MailOpen className="h-8 w-8 text-nomad-gold" />
          <h3 className="font-display text-lg font-semibold text-nomad-white">No Messages Yet</h3>
          <p className="max-w-sm text-sm text-nomad-ash">
            Messages from the public contact form will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {submissions.map((contact) => (
            <ContactRow key={contact.id} contact={contact} />
          ))}
        </div>
      )}
    </div>
  );
}
