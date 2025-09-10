"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { faker } from "@faker-js/faker";
import { Pencil, Trash2, Pause, Play, Plus, RotateCcw } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

type RoleStatus = "Active" | "Inactive";

type RoleRow = {
  id: string;
  name: "Super Admin" | "Admin" | "Operational";
  usersCount: number;
  status: RoleStatus;
};

const ROLE_NAMES: RoleRow["name"][] = ["Super Admin", "Admin", "Operational"];

const sampleRoles: RoleRow[] = (() => {
  const rows: RoleRow[] = [];
  for (let i = 0; i < ROLE_NAMES.length; i++) {
    const status: RoleStatus = faker.number.int({ min: 0, max: 100 }) < 80 ? "Active" : "Inactive";
    rows.push({
      id: faker.string.uuid(),
      name: ROLE_NAMES[i],
      usersCount: faker.number.int({ min: 1, max: 20 }),
      status,
    });
  }
  return rows;
})();

function AdminRoles() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"All" | RoleStatus>("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "edit" | "pause" | "resume" | "delete";
    role: RoleRow | null;
  }>({
    isOpen: false,
    action: "edit",
    role: null,
  });

  const filtered = useMemo(() => {
    return sampleRoles.filter((r) => {
      const matchKeyword =
        keyword.trim() === ""
          ? true
          : r.name.toLowerCase().includes(keyword.toLowerCase());
      const matchStatus = status === "All" ? true : r.status === status;
      return matchKeyword && matchStatus;
    });
  }, [keyword, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetFilters = () => {
    setKeyword("");
    setStatus("All");
    setPage(1);
  };

  const handleActionClick = (action: "edit" | "pause" | "resume" | "delete", role: RoleRow) => {
    if (action === "edit") {
      // For edit we don't open confirmation dialog, we navigate via Link
      return;
    }
    setConfirmDialog({ isOpen: true, action, role });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.role) return;
    // Here you would typically make an API call based on action
    console.log(`${confirmDialog.action} role:`, confirmDialog.role);
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
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-3 text-left font-medium">NO</th>
              <th className="px-3 py-3 text-left font-medium">NAME</th>
              <th className="px-3 py-3 text-left font-medium">USERS</th>
              <th className="px-3 py-3 text-left font-medium">STATUS</th>
              <th className="px-3 py-3 text-left font-medium">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                  No data
                </td>
              </tr>
            ) : (
              paged.map((r, idx) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-3">{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td className="px-3 py-3">{r.name}</td>
                  <td className="px-3 py-3">{r.usersCount}</td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          r.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-700"
                        )
                      }
                    >
                      {r.status}
                    </span>
                  </td>
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
                      {r.status === "Active" ? (
                        <button
                          onClick={() => handleActionClick("pause", r)}
                          className="border-l p-2.5 hover:bg-muted"
                          aria-label="Pause"
                          title="Pause"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActionClick("resume", r)}
                          className="border-l p-2.5 hover:bg-muted"
                          aria-label="Resume"
                          title="Resume"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
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
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages} • {filtered.length} items
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
        confirmText="OK"
        cancelText="Cancel"
        variant={confirmDialog.action === "delete" ? "destructive" : "default"}
      />
    </div>
  );
}

export default AdminRoles;