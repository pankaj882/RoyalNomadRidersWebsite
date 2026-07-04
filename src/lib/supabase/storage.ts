import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { GALLERY_BUCKET } from "@/lib/gallery-storage-shared";

export { GALLERY_BUCKET, buildGalleryStoragePath, getGalleryPublicUrl } from "@/lib/gallery-storage-shared";

/**
 * Deletes one or more objects from the gallery bucket using the
 * service-role client (bypasses Storage RLS). Used by admin delete actions
 * after the corresponding Prisma rows are confirmed removable.
 */
export async function deleteGalleryStorageObjects(storagePaths: string[]): Promise<{ success: boolean; error?: string }> {
  if (storagePaths.length === 0) return { success: true };

  const supabase = await createAdminClient();
  const { error } = await supabase.storage.from(GALLERY_BUCKET).remove(storagePaths);

  if (error) {
    console.error("Failed to delete gallery storage objects:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
