"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Pencil, Pause, Play, Trash2, Plus, RotateCcw } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  useKnowledgesControllerFindAll,
  useKnowledgesControllerRemove,
  useKnowledgesControllerUpdate,
  getKnowledgesControllerFindAllQueryKey,
} from "@/sdk/knowledges/knowledges";
import type { Knowledge as ApiKnowledge } from "@/sdk/models/knowledge";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type UiKnowledge = {
  id: string;
  name: string;
  updatedAt: string;
  status: "Active" | "Inactive";
};

function AdminKnowledges() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const queryClient = useQueryClient();

  const skip = useMemo(() => Math.max(0, (page - 1) * pageSize), [page, pageSize]);
  const take = pageSize;
  const isActiveParam = status === "All" ? "" : status === "Active" ? "true" : "false";

  const { data, isLoading, isError, isFetching, refetch } = useKnowledgesControllerFindAll(
    { skip, take, search: keyword, category: "", isActive: isActiveParam },
    { query: {} }
  );

  const deleteMutation = useKnowledgesControllerRemove({
    mutation: {
      onSuccess: async () => {
        toast.success("Knowledge deleted", { duration: 2000 });
        await queryClient.invalidateQueries({
          queryKey: getKnowledgesControllerFindAllQueryKey({ skip, take, search: keyword, category: "", isActive: isActiveParam }) as unknown as any,
        });
        refetch();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to delete knowledge";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  const updateMutation = useKnowledgesControllerUpdate({
    mutation: {
      onSuccess: async () => {
        toast.success("Knowledge updated", { duration: 1500 });
        await queryClient.invalidateQueries({
          queryKey: getKnowledgesControllerFindAllQueryKey({ skip, take, search: keyword, category: "", isActive: isActiveParam }) as unknown as any,
        });
        refetch();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to update knowledge";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  const apiRows: UiKnowledge[] = useMemo(() => {
    const rows = (data?.data ?? []) as ApiKnowledge[];
    return rows.map((k) => ({
      id: k.id,
      name: k.name,
      updatedAt: new Date(k.updatedAt).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" }),
      status: k.isActive ? "Active" : "Inactive",
    }));
  }, [data]);

  const currentPage = page;
  const hasNextPage = apiRows.length === pageSize;
  const totalPages = Math.max(1, currentPage + (hasNextPage ? 1 : 0));

  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "pause" | "resume" | "delete";
    knowledge: UiKnowledge | null;
  }>({
    isOpen: false,
    action: "pause",
    knowledge: null,
  });

  const resetFilters = () => {
    setKeyword("");
    setStatus("All");
    setPage(1);
  };

  const handleActionClick = (action: "pause" | "resume" | "delete", knowledge: UiKnowledge) => {
    setConfirmDialog({ isOpen: true, action, knowledge });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.knowledge) return;
    const k = confirmDialog.knowledge;
    if (confirmDialog.action === "delete") {
      deleteMutation.mutate({ id: k.id });
    } else if (confirmDialog.action === "pause") {
      updateMutation.mutate({ id: k.id, data: { isActive: false } });
    } else if (confirmDialog.action === "resume") {
      updateMutation.mutate({ id: k.id, data: { isActive: true } });
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
          <li className="text-foreground">Knowledges</li>
        </ol>
      </nav>

      {/* Title + Action */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold md:text-2xl">Knowledges</h1>
        <Link
          href="/admin/knowledges/new"
          className={
            cn(
              "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground",
              "border border-primary shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )
          }
        >
          <Plus className="h-4 w-4" />
          New Knowledge
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
          placeholder="Keyword (title)..."
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as any);
          }}
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <div className="flex md:col-span-2 lg:col-span-2">
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
          <div className="p-6 text-sm text-muted-foreground">Loading knowledges…</div>
        ) : isError ? (
          <div className="p-6 text-sm text-red-600">Failed to load knowledges.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-3 text-left font-medium">NO</th>
                <th className="px-3 py-3 text-left font-medium">TITLE</th>
                <th className="px-3 py-3 text-left font-medium">LAST UPDATE</th>
                <th className="px-3 py-3 text-left font-medium">STATUS</th>
                <th className="px-3 py-3 text-left font-medium">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {apiRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                    No data
                  </td>
                </tr>
              ) : (
                apiRows.map((k, idx) => (
                  <tr key={k.id} className="border-t">
                    <td className="px-3 py-3">{(currentPage - 1) * pageSize + idx + 1}</td>
                    <td className="px-3 py-3">{k.name}</td>
                    <td className="px-3 py-3">{k.updatedAt}</td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            k.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-700"
                          )
                        }
                      >
                        {k.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="inline-flex overflow-hidden rounded-md border">
                        <Link
                          href={`/admin/knowledges/detail/${k.id}`}
                          className="p-2.5 hover:bg-muted"
                          aria-label="Edit"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        {k.status === "Active" ? (
                          <button
                            onClick={() => handleActionClick("pause", k)}
                            className="border-l p-2.5 hover:bg-muted"
                            aria-label="Pause"
                            title="Pause"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActionClick("resume", k)}
                            className="border-l p-2.5 hover:bg-muted"
                            aria-label="Resume"
                            title="Resume"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleActionClick("delete", k)}
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
          Page {currentPage} of {totalPages} • {apiRows.length} items
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
        message={`Are you sure to ${confirmDialog.action} ${confirmDialog.knowledge?.name}?`}
        confirmText={deleteMutation.isPending || updateMutation.isPending ? "Working..." : "OK"}
        cancelText="Cancel"
        variant={confirmDialog.action === "delete" ? "destructive" : "default"}
      />
    </div>
  );
}

export default AdminKnowledges;