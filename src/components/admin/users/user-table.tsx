"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FounderDisplayDialog } from "@/components/admin/users/founder-display-dialog";
import { updateUserRoleAction, toggleUserActiveAction } from "@/app/admin/users/actions";
import { getInitials, formatDate } from "@/lib/utils";
import { roleLabels } from "@/lib/constants";
import type { Role, User } from "@/types";

interface UserWithCounts extends User {
  _count: { blogs: number; registrations: number };
}

interface UserTableProps {
  users: UserWithCounts[];
  currentUserId: string;
}

const ROLE_OPTIONS: Role[] = ["SUPER_ADMIN", "ADMIN", "BLOG_AUTHOR", "MEMBER"];

export function UserTable({ users, currentUserId }: UserTableProps) {
  const router = useRouter();

  async function handleRoleChange(userId: string, role: string) {
    const result = await updateUserRoleAction(userId, role);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Role updated.");
    router.refresh();
  }

  async function handleToggleActive(userId: string, isActive: boolean) {
    const result = await toggleUserActiveAction(userId, isActive);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message ?? "Updated.");
    router.refresh();
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-nomad-steel">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="bg-nomad-charcoal text-xs uppercase tracking-wide text-nomad-ash">
          <tr>
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Activity</th>
            <th className="px-4 py-3 font-medium">Joined</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-nomad-steel bg-nomad-black">
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <tr key={user.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-nomad-white">
                        {user.name} {isSelf && <span className="text-xs text-nomad-ash">(you)</span>}
                      </p>
                      <p className="truncate text-xs text-nomad-ash">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                    disabled={isSelf}
                  >
                    <SelectTrigger className="h-9 w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role} value={role}>
                          {roleLabels[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-xs text-nomad-ash">
                  {user._count.blogs} post{user._count.blogs === 1 ? "" : "s"} &middot; {user._count.registrations}{" "}
                  ride{user._count.registrations === 1 ? "" : "s"}
                </td>
                <td className="px-4 py-3 text-nomad-ash">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3">
                  <Badge variant={user.isActive ? "success" : "destructive"}>
                    {user.isActive ? "Active" : "Deactivated"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <FounderDisplayDialog user={user} />
                    {!isSelf && (
                      <ConfirmDialog
                        trigger={
                          <Button
                            size="sm"
                            variant="ghost"
                            className={user.isActive ? "text-red-400 hover:text-red-300" : "text-emerald-400 hover:text-emerald-300"}
                          >
                            {user.isActive ? "Deactivate" : "Reactivate"}
                          </Button>
                        }
                        title={user.isActive ? "Deactivate this account?" : "Reactivate this account?"}
                        description={
                          user.isActive
                            ? `${user.name} will immediately lose access to sign in. Their content (blogs, comments, registrations) is kept.`
                            : `${user.name} will be able to sign in again.`
                        }
                        confirmLabel={user.isActive ? "Deactivate" : "Reactivate"}
                        variant={user.isActive ? "destructive" : "default"}
                        onConfirm={() => handleToggleActive(user.id, !user.isActive)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
