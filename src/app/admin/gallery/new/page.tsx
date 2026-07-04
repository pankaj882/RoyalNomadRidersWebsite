import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AlbumForm } from "@/components/admin/gallery/album-form";
import { requireManagementAccess } from "@/lib/auth";

export const metadata: Metadata = { title: "New Album", robots: { index: false, follow: false } };

export default async function NewAlbumPage() {
  await requireManagementAccess();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link href="/admin/gallery" className="flex w-fit items-center gap-1.5 text-sm text-nomad-ash hover:text-nomad-white">
        <ArrowLeft className="h-4 w-4" />
        Back to Gallery
      </Link>

      <div>
        <h1 className="font-display text-3xl font-bold text-nomad-white">New Album</h1>
        <p className="mt-1 text-sm text-nomad-ash">
          Create the album first, then upload photos to it on the next screen.
        </p>
      </div>

      <div className="rounded-xl border border-nomad-steel bg-nomad-charcoal p-6 sm:p-8">
        <AlbumForm />
      </div>
    </div>
  );
}
