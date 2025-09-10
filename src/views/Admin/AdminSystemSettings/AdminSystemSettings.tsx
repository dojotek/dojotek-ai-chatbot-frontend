"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { faker } from "@faker-js/faker";
import { Trash2, Plus, Loader2, RotateCcw } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

type SettingType = "General" | "Sensitive";
type SettingStatus = "Active" | "Inactive";

type SettingRow = {
  id: string;
  key: string;
  type: SettingType;
  value: string;
  status: SettingStatus;
};

const TYPE_OPTIONS: SettingType[] = ["General", "Sensitive"];
const STATUS_OPTIONS: SettingStatus[] = ["Active", "Inactive"];

const sampleSettings: SettingRow[] = (() => {
  const rows: SettingRow[] = [];
  for (let i = 0; i < 300; i++) {
    const type = faker.helpers.arrayElement(TYPE_OPTIONS);
    const key = faker.helpers
      .slugify(`${faker.hacker.noun()}_${faker.hacker.verb()}_${faker.number.int({ min: 1, max: 999 })}`)
      .replace(/-/g, "_")
      .toLowerCase();
    rows.push({
      id: faker.string.uuid(),
      key,
      type,
      value: faker.lorem.sentence({ min: 3, max: 8 }),
      status: faker.number.int({ min: 0, max: 100 }) < 80 ? "Active" : "Inactive",
    });
  }
  return rows;
})();

function AdminSystemSettings() {
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState<"All" | SettingType>("All");
  const [status, setStatus] = useState<"All" | SettingStatus>("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Editable rows state
  const [rows, setRows] = useState<SettingRow[]>(sampleSettings);

  // Saving states for inline feedback
  const [savingTypeId, setSavingTypeId] = useState<string | null>(null);
  const [savingValueId, setSavingValueId] = useState<string | null>(null);

  // Simple toast state
  const [toastVisible, setToastVisible] = useState(false);
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "delete";
    setting: SettingRow | null;
  }>({
    isOpen: false,
    action: "delete",
    setting: null,
  });

  const showToast = () => {
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 1400);
  };

  const handleActionClick = (action: "delete", setting: SettingRow) => {
    setConfirmDialog({
      isOpen: true,
      action,
      setting,
    });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.setting) return;
    
    // Here you would typically make an API call
    console.log(`${confirmDialog.action} setting:`, confirmDialog.setting);
    
    // For demo purposes, we'll just log the action
    // In a real app, you'd delete the setting
  };

  const filtered = useMemo(() => {
    return rows.filter((s) => {
      const matchKeyword =
        keyword.trim() === ""
          ? true
          : s.key.toLowerCase().includes(keyword.toLowerCase());
      const matchType = type === "All" ? true : s.type === type;
      const matchStatus = status === "All" ? true : s.status === status;
      return matchKeyword && matchType && matchStatus;
    });
  }, [rows, keyword, type, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetFilters = () => {
    setKeyword("");
    setType("All");
    setStatus("All");
    setPage(1);
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
        <Link
          href="#"
          className={
            cn(
              "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground",
              "border border-primary shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )
          }
        >
          <Plus className="h-4 w-4" />
          New Setting
        </Link>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-5 rounded-md border bg-white p-3 md:p-4">
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
          value={type}
          onChange={(e) => {
            setPage(1);
            setType(e.target.value as any);
          }}
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
        >
          <option value="All">All Types</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as any);
          }}
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
        >
          <option value="All">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
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
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-3 text-left font-medium">NO</th>
              <th className="px-3 py-3 text-left font-medium">KEY</th>
              <th className="px-3 py-3 text-left font-medium">TYPE</th>
              <th className="px-3 py-3 text-left font-medium">VALUE</th>
              <th className="px-3 py-3 text-left font-medium">STATUS</th>
              <th className="px-3 py-3 text-left font-medium">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                  No data
                </td>
              </tr>
            ) : (
              paged.map((s, idx) => (
                <tr key={s.id} className="border-t">
                  <td className="px-3 py-3">{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td className="px-3 py-3">{s.key}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={s.type}
                        disabled={savingTypeId === s.id}
                        onChange={(e) => {
                          const newType = e.target.value as SettingType;
                          setRows((prev) => prev.map((r) => (r.id === s.id ? { ...r, type: newType } : r)));
                          setSavingTypeId(s.id);
                          window.setTimeout(() => {
                            setSavingTypeId(null);
                            showToast();
                          }, 800);
                        }}
                        className="w-full rounded-md border bg-background px-2.5 py-1.5 text-sm"
                      >
                        {TYPE_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      {savingTypeId === s.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={s.value}
                        disabled={savingValueId === s.id}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setRows((prev) => prev.map((r) => (r.id === s.id ? { ...r, value: newValue } : r)));
                        }}
                        onBlur={() => {
                          setSavingValueId(s.id);
                          window.setTimeout(() => {
                            setSavingValueId(null);
                            showToast();
                          }, 800);
                        }}
                        className="w-full rounded-md border bg-background px-2.5 py-1.5 text-sm"
                      />
                      {savingValueId === s.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          s.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-700"
                        )
                      }
                    >
                      {s.status}
                    </span>
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

      {/* Toast */}
      {toastVisible ? (
        <div className="fixed bottom-4 right-4 rounded-md border bg-white px-4 py-2 text-sm shadow-sm">
          Setting Saved
        </div>
      ) : null}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title="Confirm Action"
        message={`Are you sure to ${confirmDialog.action} ${confirmDialog.setting?.key}?`}
        confirmText="OK"
        cancelText="Cancel"
        variant={confirmDialog.action === "delete" ? "destructive" : "default"}
      />
    </div>
  );
}

export default AdminSystemSettings;