import type { Metadata } from "next";
import { Users as UsersIcon } from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth";
import { getAllUsersAdmin } from "@/lib/data/admin-users";
import { UserTable } from "@/components/admin/users/user-table";

export const metadata: Metadata = { title: "Manage Users", robots: { index: false, follow: false } };

export default async function AdminUsersPage() {
  const currentUser = await requireSuperAdmin();
  const users = await getAllUsersAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-nomad-red/10">
          <UsersIcon className="h-5 w-5 text-nomad-red" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold text-nomad-white">Users</h1>
          <p className="text-sm text-nomad-ash">
            Manage roles, account access, and About page display. Super Admin only.
          </p>
        </div>
      </div>

      <UserTable users={users} currentUserId={currentUser.id} />
    </div>
  );
}
