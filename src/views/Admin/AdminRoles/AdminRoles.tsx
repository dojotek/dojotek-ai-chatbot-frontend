"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, Plus, RotateCcw } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useRolesControllerFindAll, useRolesControllerRemove, getRolesControllerFindAllQueryKey } from "@/sdk/roles/roles";
import type { Role as ApiRole } from "@/sdk/models/role";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type UiRole = {
  id: string;
  name: string;
};

function AdminRoles() {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "edit" | "delete";
    role: UiRole | null;
  }>({
    isOpen: false,
    action: "edit",
    role: null,
  });

  const queryClient = useQueryClient();

  const skip = useMemo(() => Math.max(0, (page - 1) * pageSize), [page, pageSize]);
  const take = pageSize;

  const { data, isLoading, isError, refetch, isFetching } = useRolesControllerFindAll(
    { skip, take, search: keyword },
    { query: {} }
  );

  const deleteMutation = useRolesControllerRemove({
    mutation: {
      onSuccess: async () => {
        toast.success("Role deleted", { duration: 2000 });
        await queryClient.invalidateQueries({
          queryKey: getRolesControllerFindAllQueryKey({ skip, take, search: keyword }) as unknown as any,
        });
        refetch();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to delete role";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  const apiRoles: UiRole[] = useMemo(() => {
    const rows = (data?.data ?? []) as ApiRole[];
    return rows.map((row) => ({ id: row.id, name: row.name }));
  }, [data]);

  const currentPage = page;
  const hasNextPage = apiRoles.length === pageSize;
  const totalPages = Math.max(1, currentPage + (hasNextPage ? 1 : 0));

  const resetFilters = () => {
    setKeyword("");
    setPage(1);
  };

  const handleActionClick = (action: "edit" | "delete", role: UiRole) => {
    if (action === "edit") {
      // For edit we don't open confirmation dialog, we navigate via Link
      return;
    }
    setConfirmDialog({ isOpen: true, action, role });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.role) return;
    if (confirmDialog.action === "delete") {
      deleteMutation.mutate({ id: confirmDialog.role.id });
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
          <li className="text-foreground">Roles</li>
        </ol>
      </nav>

      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold md:text-2xl">Roles</h1>
        <Link
          href="/admin/roles/new"
          className={
            cn(
              "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground",
              "border border-primary shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )
          }
        >
          <Plus className="h-4 w-4" />
          New Role
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
          placeholder="Keyword (role name)..."
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
        />
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
          <div className="p-6 text-sm text-muted-foreground">Loading roles…</div>
        ) : isError ? (
          <div className="p-6 text-sm text-red-600">Failed to load roles.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-3 text-left font-medium">NO</th>
                <th className="px-3 py-3 text-left font-medium">NAME</th>
                <th className="px-3 py-3 text-left font-medium">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {apiRoles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-8 text-center text-muted-foreground">
                    No data
                  </td>
                </tr>
              ) : (
                apiRoles.map((r, idx) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-3">{(currentPage - 1) * pageSize + idx + 1}</td>
                    <td className="px-3 py-3">{r.name}</td>
                    <td className="px-3 py-3">
                      <div className="inline-flex overflow-hidden rounded-md border">
                        <Link
                          href={`/admin/roles/edit/${r.id}`}
                          className="p-2.5 hover:bg-muted"
                          aria-label="Edit"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleActionClick("delete", r)}
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
          Page {currentPage} of {totalPages} • {apiRoles.length} items
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
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title="Confirm Action"
        message={`Are you sure to ${confirmDialog.action} ${confirmDialog.role?.name}?`}
        confirmText={deleteMutation.isPending ? "Working..." : "OK"}
        cancelText="Cancel"
        variant={confirmDialog.action === "delete" ? "destructive" : "default"}
      />
    </div>
  );
}

export default AdminRoles;