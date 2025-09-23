"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Trash2, Plus, Loader2, RotateCcw } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useSettingsControllerFindAll,
  getSettingsControllerFindAllQueryKey,
  useSettingsControllerUpdate,
  useSettingsControllerCreate,
  useSettingsControllerRemove,
} from "@/sdk/settings/settings";
import type { Setting as ApiSetting } from "@/sdk/models/setting";

type UiSetting = {
  id: string;
  key: string;
  value: string;
  description?: string;
  category?: string;
};

const CATEGORY_OPTIONS: string[] = ["General", "Sensitive", "System", "Integration"];

function AdminSystemSettings() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const queryClient = useQueryClient();

  const skip = useMemo(() => Math.max(0, (page - 1) * pageSize), [page, pageSize]);
  const take = pageSize;

  const { data, isLoading, isError, refetch, isFetching } = useSettingsControllerFindAll(
    { skip, take, search: keyword, category },
    { query: {} }
  );

  const updateMutation = useSettingsControllerUpdate({
    mutation: {
      onSuccess: async () => {
        toast.success("Setting saved", { duration: 1500 });
        setPendingSnackbar(false);
        await queryClient.invalidateQueries({
          queryKey: getSettingsControllerFindAllQueryKey({ skip, take, search: keyword, category }) as unknown as any,
        });
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to save setting";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  const createMutation = useSettingsControllerCreate({
    mutation: {
      onSuccess: async () => {
        toast.success("Setting created", { duration: 2000 });
        await queryClient.invalidateQueries({
          queryKey: getSettingsControllerFindAllQueryKey({ skip, take, search: keyword, category }) as unknown as any,
        });
        setCreateOpen(false);
        setCreateForm({ key: "", value: "", description: "", category: "" });
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to create setting";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  const deleteMutation = useSettingsControllerRemove({
    mutation: {
      onSuccess: async () => {
        toast.success("Setting deleted", { duration: 2000 });
        await queryClient.invalidateQueries({
          queryKey: getSettingsControllerFindAllQueryKey({ skip, take, search: keyword, category }) as unknown as any,
        });
        refetch();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to delete setting";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  const apiRows: UiSetting[] = useMemo(() => {
    const rows = (data?.data ?? []) as ApiSetting[];
    return rows.map((r) => ({ id: r.id, key: r.key, value: r.value, description: r.description as any, category: r.category as any }));
  }, [data]);

  // Local editable rows state synchronized with API rows
  const [rows, setRows] = useState<UiSetting[]>([]);
  const originalRowsRef = useRef<Record<string, UiSetting>>({});
  useEffect(() => {
    setRows(apiRows);
    const next: Record<string, UiSetting> = {};
    apiRows.forEach((r) => (next[r.id] = { ...r }));
    originalRowsRef.current = next;
    setDirtyIds(new Set());
  }, [apiRows]);

  const currentPage = page;
  const hasNextPage = apiRows.length === pageSize;
  const totalPages = Math.max(1, currentPage + (hasNextPage ? 1 : 0));

  const resetFilters = () => {
    setKeyword("");
    setCategory("");
    setPage(1);
  };

  // Pending changes snackbar state
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [pendingSnackbar, setPendingSnackbar] = useState(false);
  useEffect(() => {
    setPendingSnackbar(dirtyIds.size > 0);
  }, [dirtyIds]);
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "delete";
    setting: UiSetting | null;
  }>({
    isOpen: false,
    action: "delete",
    setting: null,
  });

  const handleActionClick = (action: "delete", setting: UiSetting) => {
    setConfirmDialog({ isOpen: true, action, setting });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.setting) return;
    if (confirmDialog.action === "delete") {
      deleteMutation.mutate({ id: confirmDialog.setting.id });
    }
  };

  // Create modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{ key: string; value: string; description?: string; category?: string }>(
    { key: "", value: "", description: "", category: "" }
  );
  const createValid = createForm.key.trim() !== "" && createForm.value.trim() !== "";

  const handleInlineChange = (id: string, field: keyof UiSetting, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } as UiSetting : r)));
    setDirtyIds((prev) => new Set(prev).add(id));
  };

  const handleInlineBlurSave = (row: UiSetting) => {
    const original = originalRowsRef.current[row.id];
    if (!original) return;
    const payload: Record<string, string> = {};
    if (row.value !== original.value) payload.value = row.value;
    if ((row.description || "") !== (original.description || "")) payload.description = row.description || "";
    if ((row.category || "") !== (original.category || "")) payload.category = row.category || "";
    if (Object.keys(payload).length === 0) {
      setDirtyIds((prev) => {
        const next = new Set(prev);
        next.delete(row.id);
        return next;
      });
      return;
    }
    updateMutation.mutate({ id: row.id, data: payload as any });
    // On success, original will be updated by refetch; clear dirty now optimistically
    setDirtyIds((prev) => {
      const next = new Set(prev);
      next.delete(row.id);
      return next;
    });
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
          <li className="text-foreground">System Settings</li>
        </ol>
      </nav>

      {/* Title + Action */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold md:text-2xl">System Settings</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className={
            cn(
              "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground",
              "border border-primary shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )
          }
        >
          <Plus className="h-4 w-4" />
          New Setting
        </button>
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
          placeholder="Keyword (key)..."
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
        />
        <select
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
        >
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
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
          <div className="p-6 text-sm text-muted-foreground">Loading settings…</div>
        ) : isError ? (
          <div className="p-6 text-sm text-red-600">Failed to load settings.</div>
        ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-3 text-left font-medium">NO</th>
              <th className="px-3 py-3 text-left font-medium">KEY</th>
                <th className="px-3 py-3 text-left font-medium">CATEGORY</th>
              <th className="px-3 py-3 text-left font-medium">VALUE</th>
                <th className="px-3 py-3 text-left font-medium">DESCRIPTION</th>
              <th className="px-3 py-3 text-left font-medium">ACTION</th>
            </tr>
          </thead>
          <tbody>
              {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                  No data
                </td>
              </tr>
            ) : (
                rows.map((s, idx) => (
                <tr key={s.id} className="border-t">
                  <td className="px-3 py-3">{(currentPage - 1) * pageSize + idx + 1}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{s.key}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <select
                          value={s.category || ""}
                          onChange={(e) => handleInlineChange(s.id, "category", e.target.value)}
                          onBlur={() => handleInlineBlurSave(s)}
                        className="w-full rounded-md border bg-background px-2.5 py-1.5 text-sm"
                      >
                          <option value="">—</option>
                          {CATEGORY_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                        {updateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={s.value}
                          onChange={(e) => handleInlineChange(s.id, "value", e.target.value)}
                          onBlur={() => handleInlineBlurSave(s)}
                        className="w-full rounded-md border bg-background px-2.5 py-1.5 text-sm"
                      />
                        {updateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={s.description || ""}
                          onChange={(e) => handleInlineChange(s.id, "description", e.target.value)}
                          onBlur={() => handleInlineBlurSave(s)}
                          className="w-full rounded-md border bg-background px-2.5 py-1.5 text-sm"
                        />
                        {updateMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : null}
                      </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="inline-flex overflow-hidden rounded-md border">
                      <button
                        onClick={() => handleActionClick("delete", s)}
                        className="p-2.5 text-red-600 hover:bg-muted"
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
          Page {currentPage} of {totalPages} • {rows.length} items
        </p>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          siblingCount={1}
        />
      </div>

      {/* Pending changes snackbar */}
      {pendingSnackbar ? (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-md border bg-white px-4 py-2 text-sm shadow-sm">
          You have pending changes… they will be saved on blur.
        </div>
      ) : null}

      {/* Create Modal */}
      {createOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCreateOpen(false)} />
          <div className="relative z-10 w-[92%] max-w-lg rounded-md border bg-white p-4 shadow-md">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">New Setting</h2>
              <button onClick={() => setCreateOpen(false)} className="text-sm text-muted-foreground hover:underline">Close</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Key *</label>
                <input
                  type="text"
                  value={createForm.key}
                  onChange={(e) => setCreateForm((f) => ({ ...f, key: e.target.value }))}
                  placeholder="e.g. app_name"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Value *</label>
                <input
                  type="text"
                  value={createForm.value}
                  onChange={(e) => setCreateForm((f) => ({ ...f, value: e.target.value }))}
                  placeholder="e.g. Dojotek AI Chatbot"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Description</label>
                <input
                  type="text"
                  value={createForm.description || ""}
                  onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Category</label>
                <select
                  value={createForm.category || ""}
                  onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">—</option>
                  {CATEGORY_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setCreateOpen(false)}
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={!createValid || createMutation.isPending}
                onClick={() => createMutation.mutate({ data: { ...createForm } as any })}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground",
                  "border border-primary disabled:opacity-50"
                )}
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title="Confirm Action"
        message={`Are you sure to ${confirmDialog.action} ${confirmDialog.setting?.key}?`}
        confirmText={deleteMutation.isPending ? "Working..." : "OK"}
        cancelText="Cancel"
        variant={confirmDialog.action === "delete" ? "destructive" : "default"}
      />
    </div>
  );
}

export default AdminSystemSettings;