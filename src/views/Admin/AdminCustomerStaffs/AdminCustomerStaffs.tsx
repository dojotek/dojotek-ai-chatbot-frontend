"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, RotateCcw, Plus } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCustomerStaffsControllerFindAll, useCustomerStaffsControllerRemove, getCustomerStaffsControllerFindAllQueryKey } from "@/sdk/customer-staffs/customer-staffs";
import type { CustomerStaff as ApiCustomerStaff } from "@/sdk/models/customerStaff";
import { useCustomersControllerFindAll } from "@/sdk/customers/customers";
import type { Customer as ApiCustomer } from "@/sdk/models/customer";

type UiStaff = {
  id: string;
  name: string;
  customerId: string;
  isActive: boolean;
};

function AdminCustomerStaffs() {
  const [keyword, setKeyword] = useState("");
  const [customerId, setCustomerId] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "delete";
    staff: UiStaff | null;
  }>({
    isOpen: false,
    action: "delete",
    staff: null,
  });
  const queryClient = useQueryClient();

  const skip = useMemo(() => Math.max(0, (page - 1) * pageSize), [page, pageSize]);
  const take = pageSize;

  const { data, isLoading, isError, refetch, isFetching } = useCustomerStaffsControllerFindAll(
    {
      skip,
      take,
      search: keyword,
      customerId: customerId,
    },
    { query: {} }
  );

  // Load customers for filter and display
  const { data: customersResp } = useCustomersControllerFindAll(
    {
      skip: 0,
      take: 1000,
      search: "",
      industry: "",
      isActive: "",
    },
    { query: {} }
  );
  const customers = useMemo(() => (customersResp?.data ?? []) as ApiCustomer[], [customersResp]);
  const customerIdToName = useMemo(() => {
    const map = new Map<string, string>();
    customers.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [customers]);

  const deleteMutation = useCustomerStaffsControllerRemove({
    mutation: {
      onSuccess: async () => {
        toast.success("Customer staff deleted", { duration: 2000 });
        await queryClient.invalidateQueries({
          queryKey: getCustomerStaffsControllerFindAllQueryKey({
            skip,
            take,
            search: keyword,
            customerId: customerId,
          }) as unknown as any,
        });
        refetch();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to delete customer staff";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  const apiStaffs: UiStaff[] = useMemo(() => {
    const rows = (data?.data ?? []) as ApiCustomerStaff[];
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      customerId: row.customerId,
      isActive: !!row.isActive,
    }));
  }, [data]);

  const currentPage = page;
  const hasNextPage = apiStaffs.length === pageSize;
  const totalPages = Math.max(1, currentPage + (hasNextPage ? 1 : 0));

  const resetFilters = () => {
    setKeyword("");
    setCustomerId("");
    setPage(1);
  };

  const handleActionClick = (action: "delete", staff: UiStaff) => {
    setConfirmDialog({
      isOpen: true,
      action,
      staff,
    });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.staff) return;
    if (confirmDialog.action === "delete") {
      deleteMutation.mutate({ id: confirmDialog.staff.id });
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
          placeholder="Keyword..."
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
        />
        <select
          value={customerId || ""}
          onChange={(e) => {
            setPage(1);
            setCustomerId(e.target.value);
          }}
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
        >
          <option value="">All Customers</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
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
          <div className="p-6 text-sm text-muted-foreground">Loading customer staffs…</div>
        ) : isError ? (
          <div className="p-6 text-sm text-red-600">Failed to load customer staffs.</div>
        ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-3 text-left font-medium">NO</th>
              <th className="px-3 py-3 text-left font-medium">NAME</th>
              <th className="px-3 py-3 text-left font-medium">CUSTOMER</th>
              <th className="px-3 py-3 text-left font-medium">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {apiStaffs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                  No data
                </td>
              </tr>
            ) : (
              apiStaffs.map((s, idx) => (
                <tr key={s.id} className="border-t">
                  <td className="px-3 py-3">{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td className="px-3 py-3">{s.name}</td>
                  <td className="px-3 py-3">{customerIdToName.get(s.customerId) ?? s.customerId}</td>
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
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages} • {apiStaffs.length} items
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
        confirmText={deleteMutation.isPending ? "Working..." : "OK"}
        cancelText="Cancel"
        variant={"destructive"}
      />
    </div>
  );
}

export default AdminCustomerStaffs;