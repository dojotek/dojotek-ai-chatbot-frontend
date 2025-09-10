"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { faker } from "@faker-js/faker";
import { Pencil, Pause, Play, Trash2, RotateCcw, Plus } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

type Staff = {
  id: string;
  name: string;
  company: string;
  status: "Active" | "Inactive";
};

const companies: string[] = (() => {
  const unique = new Set<string>();
  while (unique.size < 100) {
    unique.add(faker.company.name());
  }
  return Array.from(unique);
})();

const sampleStaffs: Staff[] = (() => {
  const rows: Staff[] = [];
  for (let i = 0; i < 1000; i++) {
    const isActive = faker.number.int({ min: 0, max: 100 }) < 70;
    rows.push({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      company: companies[faker.number.int({ min: 0, max: companies.length - 1 })],
      status: isActive ? "Active" : "Inactive",
    });
  }
  return rows;
})();

function AdminCustomerStaffs() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [company, setCompany] = useState<string>("All");
  const [companyOpen, setCompanyOpen] = useState(false);
  const [companyQuery, setCompanyQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "pause" | "resume" | "delete";
    staff: Staff | null;
  }>({
    isOpen: false,
    action: "pause",
    staff: null,
  });

  const filteredCompanyList = useMemo(() => {
    if (!companyQuery) return companies;
    const q = companyQuery.toLowerCase();
    return companies.filter((c) => c.toLowerCase().includes(q));
  }, [companyQuery]);

  const filtered = useMemo(() => {
    return sampleStaffs.filter((s) => {
      const matchKeyword =
        s.name.toLowerCase().includes(keyword.toLowerCase()) ||
        s.company.toLowerCase().includes(keyword.toLowerCase());
      const matchStatus = status === "All" ? true : s.status === status;
      const matchCompany = company === "All" ? true : s.company === company;
      return matchKeyword && matchStatus && matchCompany;
    });
  }, [keyword, status, company]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetFilters = () => {
    setKeyword("");
    setStatus("All");
    setCompany("All");
    setCompanyQuery("");
    setCompanyOpen(false);
    setPage(1);
  };

  const handleActionClick = (action: "pause" | "resume" | "delete", staff: Staff) => {
    setConfirmDialog({
      isOpen: true,
      action,
      staff,
    });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.staff) return;
    
    // Here you would typically make an API call
    console.log(`${confirmDialog.action} staff:`, confirmDialog.staff);
    
    // For demo purposes, we'll just log the action
    // In a real app, you'd update the staff status or delete the staff
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
          <li className="text-foreground">Customer Staffs</li>
        </ol>
      </nav>

      {/* Title + Action */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold md:text-2xl">Customer Staffs</h1>
        <Link
          href="/admin/customer-staffs/new"
          className={cn(
            "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground",
            "border border-primary shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
        >
          <Plus className="h-4 w-4" />
          New Staff
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
          placeholder="Keyword (name or company)..."
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
        />
        <div className="relative">
          <button
            type="button"
            onClick={() => setCompanyOpen((o) => !o)}
            className="w-full rounded-md border bg-background px-4 py-2.5 text-sm text-left flex items-center justify-between"
            aria-haspopup="listbox"
            aria-expanded={companyOpen}
          >
            <span>{company === "All" ? "All Companies" : company}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 opacity-60"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {companyOpen && (
            <div
              className="absolute z-20 mt-1 w-full rounded-md border bg-white shadow focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Escape") setCompanyOpen(false);
              }}
            >
              <div className="p-2 border-b">
                <input
                  autoFocus
                  type="text"
                  value={companyQuery}
                  onChange={(e) => setCompanyQuery(e.target.value)}
                  placeholder="Search company..."
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <ul role="listbox" className="max-h-56 overflow-auto py-1 text-sm">
                <li>
                  <button
                    type="button"
                    role="option"
                    onClick={() => {
                      setCompany("All");
                      setPage(1);
                      setCompanyOpen(false);
                    }}
                    className={"w-full text-left px-3 py-2 hover:bg-muted"}
                    aria-selected={company === "All"}
                  >
                    All Companies
                  </button>
                </li>
                {filteredCompanyList.length === 0 ? (
                  <li className="px-3 py-2 text-muted-foreground">No company found.</li>
                ) : (
                  filteredCompanyList.map((c) => (
                    <li key={c}>
                      <button
                        type="button"
                        role="option"
                        onClick={() => {
                          setCompany(c);
                          setPage(1);
                          setCompanyOpen(false);
                        }}
                        className={"w-full text-left px-3 py-2 hover:bg-muted"}
                        aria-selected={company === c}
                      >
                        {c}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
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
              <th className="px-3 py-3 text-left font-medium">COMPANY</th>
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
              paged.map((s, idx) => (
                <tr key={s.id} className="border-t">
                  <td className="px-3 py-3">{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td className="px-3 py-3">{s.name}</td>
                  <td className="px-3 py-3">{s.company}</td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        s.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-700"
                      )}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="inline-flex overflow-hidden rounded-md border">
                      <Link
                        href={`/admin/customer-staffs/edit/${s.id}`}
                        className="p-2.5 hover:bg-muted"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      {s.status === "Active" ? (
                        <button
                          onClick={() => handleActionClick("pause", s)}
                          className="border-l p-2.5 hover:bg-muted"
                          aria-label="Pause"
                          title="Pause"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActionClick("resume", s)}
                          className="border-l p-2.5 hover:bg-muted"
                          aria-label="Resume"
                          title="Resume"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleActionClick("delete", s)}
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
        message={`Are you sure to ${confirmDialog.action} ${confirmDialog.staff?.name}?`}
        confirmText="OK"
        cancelText="Cancel"
        variant={confirmDialog.action === "delete" ? "destructive" : "default"}
      />
    </div>
  );
}

export default AdminCustomerStaffs;