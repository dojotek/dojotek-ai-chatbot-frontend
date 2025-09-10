"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { faker } from "@faker-js/faker";
import { Pencil, Trash2, Plus, CheckCircle, AlertTriangle } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

type UserRole = "Super Admin" | "Admin" | "Operational" | "Read Only";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLogin: Date;
  hasTwoFactorAuth: boolean;
  status: "Active" | "Inactive";
};

const ROLE_OPTIONS: UserRole[] = ["Super Admin", "Admin", "Operational", "Read Only"];

const sampleUsers: UserRow[] = (() => {
  const rows: UserRow[] = [];
  for (let i = 0; i < 500; i++) {
    const fullName = faker.person.fullName();
    const email = faker.internet.email({ firstName: fullName.split(" ")[0], lastName: fullName.split(" ").slice(1).join(" ") }).toLowerCase();
    const isActive = faker.number.int({ min: 0, max: 100 }) < 80;
    rows.push({
      id: faker.string.uuid(),
      name: fullName,
      email,
      role: faker.helpers.arrayElement(ROLE_OPTIONS),
      lastLogin: faker.date.between({ from: new Date(2023, 0, 1), to: new Date() }),
      hasTwoFactorAuth: faker.datatype.boolean(0.5),
      status: isActive ? "Active" : "Inactive",
    });
  }
  return rows;
})();

function formatLastLogin(date: Date) {
  const month = date.toLocaleString("en-US", { month: "long" });
  const day = date.toLocaleString("en-US", { day: "2-digit" });
  const year = date.getFullYear();
  const time = date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${month} ${day}, ${year} - ${time}`;
}

function AdminUsers() {
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState<"All" | UserRole>("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "edit" | "delete";
    user: UserRow | null;
  }>({
    isOpen: false,
    action: "edit",
    user: null,
  });

  const filtered = useMemo(() => {
    return sampleUsers.filter((u) => {
      const matchKeyword =
        keyword.trim() === ""
          ? true
          : u.name.toLowerCase().includes(keyword.toLowerCase()) || u.email.toLowerCase().includes(keyword.toLowerCase());
      const matchRole = role === "All" ? true : u.role === role;
      return matchKeyword && matchRole;
    });
  }, [keyword, role]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetFilters = () => {
    setKeyword("");
    setRole("All");
    setPage(1);
  };

  const handleActionClick = (action: "edit" | "delete", user: UserRow) => {
    setConfirmDialog({
      isOpen: true,
      action,
      user,
    });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.user) return;
    
    // Here you would typically make an API call
    console.log(`${confirmDialog.action} user:`, confirmDialog.user);
    
    // For demo purposes, we'll just log the action
    // In a real app, you'd edit the user or delete the user
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
          value={role}
          onChange={(e) => {
            setPage(1);
            setRole(e.target.value as any);
          }}
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
        >
          <option value="All">All Roles</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <div className="flex md:col-span-2 lg:col-span-1">
          <button
            onClick={resetFilters}
            className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm"
          >
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
              <th className="px-3 py-3 text-left font-medium">EMAIL</th>
              <th className="px-3 py-3 text-left font-medium">ROLES</th>
              <th className="px-3 py-3 text-left font-medium">LAST LOGIN</th>
              <th className="px-3 py-3 text-left font-medium">2FA</th>
              <th className="px-3 py-3 text-left font-medium">STATUS</th>
              <th className="px-3 py-3 text-left font-medium">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                  No data
                </td>
              </tr>
            ) : (
              paged.map((u, idx) => (
                <tr key={u.id} className="border-t">
                  <td className="px-3 py-3">{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td className="px-3 py-3">{u.name}</td>
                  <td className="px-3 py-3">{u.email}</td>
                  <td className="px-3 py-3">{u.role}</td>
                  <td className="px-3 py-3">{formatLastLogin(u.lastLogin)}</td>
                  <td className="px-3 py-3">
                    {u.hasTwoFactorAuth ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <CheckCircle className="h-4 w-4" />
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <AlertTriangle className="h-4 w-4" />
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          u.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-700"
                        )
                      }
                    >
                      {u.status}
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
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title="Confirm Action"
        message={`Are you sure to ${confirmDialog.action} ${confirmDialog.user?.name}?`}
        confirmText="OK"
        cancelText="Cancel"
        variant={confirmDialog.action === "delete" ? "destructive" : "default"}
      />
    </div>
  );
}

export default AdminUsers;