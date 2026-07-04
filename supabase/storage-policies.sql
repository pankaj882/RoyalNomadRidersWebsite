-- =============================================================================
-- ROYAL NOMAD RIDERS CLUB — SUPABASE STORAGE POLICIES
-- =============================================================================
-- Prisma manages the Postgres schema (prisma/schema.prisma) but does NOT
-- manage Supabase Storage buckets or their Row Level Security policies —
-- those live on `storage.objects`, a table Supabase owns. Run this file
-- once, manually, in the Supabase Dashboard's SQL Editor after creating the
-- `gallery` bucket (Storage -> New Bucket -> name: "gallery", Public: ON).
--
-- These policies enforce, at the database level, that only Admins and
-- Super Admins can write to the bucket — matching `MANAGEMENT_ROLES` in
-- src/lib/constants.ts — while anyone can read (view) public gallery photos.
-- =============================================================================

-- 1. Public read access — anyone can view gallery photos (the bucket itself
--    is also marked "Public" in the dashboard; this policy is what actually
--    grants SELECT under RLS).
create policy "Public can view gallery photos"
on storage.objects for select
using (bucket_id = 'gallery');

-- 2. Only Admins/Super Admins can upload new photos.
create policy "Admins can upload gallery photos"
on storage.objects for insert
with check (
  bucket_id = 'gallery'
  and exists (
    select 1 from public.users
    where users.id = auth.uid()
      and users.role in ('SUPER_ADMIN', 'ADMIN')
  )
);

-- 3. Only Admins/Super Admins can update (overwrite) existing photos.
create policy "Admins can update gallery photos"
on storage.objects for update
using (
  bucket_id = 'gallery'
  and exists (
    select 1 from public.users
    where users.id = auth.uid()
      and users.role in ('SUPER_ADMIN', 'ADMIN')
  )
);

-- 4. Only Admins/Super Admins can delete photos.
create policy "Admins can delete gallery photos"
on storage.objects for delete
using (
  bucket_id = 'gallery'
  and exists (
    select 1 from public.users
    where users.id = auth.uid()
      and users.role in ('SUPER_ADMIN', 'ADMIN')
  )
);

-- NOTE: The app's server-side delete actions (deleteAlbumAction,
-- deleteImageAction in src/app/admin/gallery/actions.ts) use the
-- SUPABASE_SERVICE_ROLE_KEY client, which bypasses RLS entirely. These
-- policies exist as defense-in-depth for any direct client-side writes
-- (the bulk uploader uploads directly from the browser using the logged-in
-- staff member's own session, so policy #2 above is the one actually
-- enforced during normal photo uploads).
