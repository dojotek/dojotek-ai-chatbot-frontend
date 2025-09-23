"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, Plus, RotateCcw } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUsersControllerFindAll, useUsersControllerRemove, getUsersControllerFindAllQueryKey } from "@/sdk/users/users";
import { useRolesControllerFindAll } from "@/sdk/roles/roles";
import type { Role as ApiRole } from "@/sdk/models/role";
import type { User as ApiUser } from "@/sdk/models/user";

type UiUser = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
};

function AdminUsers() {
  const [keyword, setKeyword] = useState("");
  const [roleId, setRoleId] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "delete";
    user: UiUser | null;
  }>({
    isOpen: false,
    action: "delete",
    user: null,
  });
  const queryClient = useQueryClient();

  const skip = useMemo(() => Math.max(0, (page - 1) * pageSize), [page, pageSize]);
  const take = pageSize;

  const { data, isLoading, isError, refetch, isFetching } = useUsersControllerFindAll(
    { skip, take, search: keyword },
    { query: {} }
  );

  // Load roles for filter and display
  const { data: rolesResp } = useRolesControllerFindAll(
    { skip: 0, take: 1000, search: "" },
    { query: {} }
  );
  const roles = useMemo(() => (rolesResp?.data ?? []) as ApiRole[], [rolesResp]);
  const roleIdToName = useMemo(() => {
    const map = new Map<string, string>();
    roles.forEach((r) => map.set(r.id, r.name));
    return map;
  }, [roles]);

  const deleteMutation = useUsersControllerRemove({
    mutation: {
      onSuccess: async () => {
        toast.success("User deleted", { duration: 2000 });
        await queryClient.invalidateQueries({
          queryKey: getUsersControllerFindAllQueryKey({ skip, take, search: keyword }) as unknown as any,
        });
        refetch();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to delete user";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  const apiUsers: UiUser[] = useMemo(() => {
    const rows = (data?.data ?? []) as ApiUser[];
    return rows.map((u) => ({
      id: u.id,
      name: (typeof u.name === "string" ? (u.name as unknown as string) : (u.name as any)?.full ?? (u.name as any)?.first ?? "") as string,
      email: u.email,
      roleId: u.roleId,
      isActive: !!u.isActive,
    }));
  }, [data]);

  // Client-side role filter on current page data
  const filteredByRole = useMemo(() => {
    if (!roleId) return apiUsers;
    return apiUsers.filter((u) => u.roleId === roleId);
  }, [apiUsers, roleId]);

  const currentPage = page;
  const hasNextPage = (data?.data?.length ?? 0) === pageSize;
  const totalPages = Math.max(1, currentPage + (hasNextPage ? 1 : 0));

  const resetFilters = () => {
    setKeyword("");
    setRoleId("");
    setPage(1);
  };

  const handleActionClick = (action: "delete", user: UiUser) => {
    setConfirmDialog({
      isOpen: true,
      action,
      user,
    });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.user) return;
    if (confirmDialog.action === "delete") {
      deleteMutation.mutate({ id: confirmDialog.user.id });
    }
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/admin/dashboards" className="hover:underline">Dashboard</Link>
          </li>
          <li>/</li>
          <li className="text-foreground">Users</li>
        </ol>
      </nav>

      {/* Title + Action */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold md:text-2xl">Users</h1>
        <Link
          href="/admin/users/new"
          className={
            cn(
              "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground",
              "border border-primary shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )
          }
        >
          <Plus className="h-4 w-4" />
          New User
        </Link>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 rounded-md border bg-white p-3 md:p-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => {
            setPage(1);
            setKeyword(e.target.value);
          }}
          placeholder="Keyword (name or email)..."
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
        />
        <select
          value={roleId || ""}
          onChange={(e) => {
            setPage(1);
            setRoleId(e.target.value);
          }}
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <div className="flex md:col-span-2 lg:col-span-1">
          <button
            onClick={resetFilters}
            className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        {isLoading || isFetching ? (
          <div className="p-6 text-sm text-muted-foreground">Loading users…</div>
        ) : isError ? (
          <div className="p-6 text-sm text-red-600">Failed to load users.</div>
        ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-3 text-left font-medium">NO</th>
              <th className="px-3 py-3 text-left font-medium">NAME</th>
              <th className="px-3 py-3 text-left font-medium">EMAIL</th>
              <th className="px-3 py-3 text-left font-medium">ROLE</th>
              <th className="px-3 py-3 text-left font-medium">STATUS</th>
              <th className="px-3 py-3 text-left font-medium">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredByRole.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                  No data
                </td>
              </tr>
            ) : (
              filteredByRole.map((u, idx) => (
                <tr key={u.id} className="border-t">
                  <td className="px-3 py-3">{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td className="px-3 py-3">{u.name || "-"}</td>
                  <td className="px-3 py-3">{u.email}</td>
                  <td className="px-3 py-3">{roleIdToName.get(u.roleId) ?? u.roleId}</td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-700"
                        )
                      }
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="inline-flex overflow-hidden rounded-md border">
                      <Link
                        href={`/admin/users/edit/${u.id}`}
                        className="p-2.5 hover:bg-muted"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleActionClick("delete", u)}
                        className="border-l p-2.5 text-red-600 hover:bg-muted"
                        aria-label="Delete"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages} • {filteredByRole.length} items
        </p>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          siblingCount={1}
        />
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title="Confirm Action"
        message={`Are you sure to ${confirmDialog.action} ${confirmDialog.user?.email}?`}
        confirmText={deleteMutation.isPending ? "Working..." : "OK"}
        cancelText="Cancel"
        variant={"destructive"}
      />
    </div>
  );
}

export default AdminUsers;