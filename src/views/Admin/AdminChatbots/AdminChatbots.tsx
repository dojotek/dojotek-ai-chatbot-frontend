"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Pencil, Pause, Play, Trash2, Plus, RotateCcw } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useChatAgentsControllerFindAll, useChatAgentsControllerRemove, useChatAgentsControllerUpdate } from "@/sdk/chat-agents/chat-agents";
import { useCustomersControllerFindAll } from "@/sdk/customers/customers";
import type { ChatAgent } from "@/sdk/models";

function AdminChatbots() {
  const [keyword, setKeyword] = useState("");
  const [customerId, setCustomerId] = useState<string>("");
  const [status, setStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const queryClient = useQueryClient();

  // Customers dropdown for filtering
  const { data: customersResp } = useCustomersControllerFindAll(
    {
      skip: 0,
      take: 1000,
      search: "",
    } as any,
    { query: {} }
  );
  const customers = useMemo(() => (customersResp?.data ?? []) as any[], [customersResp]);

  // Fetch chat agents for current page
  const { data: agentsResp, isFetching } = useChatAgentsControllerFindAll(
    {
      skip: (page - 1) * pageSize,
      take: pageSize,
      search: keyword,
      customerId: customerId || "",
    } as any,
    { query: {} }
  );
  const rows = useMemo(() => (agentsResp?.data ?? []) as ChatAgent[], [agentsResp]);

  // We don't have total count; infer if there might be a next page
  const hasNext = rows.length === pageSize;
  const totalPages = Math.max(1, page + (hasNext ? 1 : 0));
  const currentPage = Math.min(page, totalPages);

  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "pause" | "resume" | "delete";
    chatbot: ChatAgent | null;
  }>({
    isOpen: false,
    action: "pause",
    chatbot: null,
  });

  const resetFilters = () => {
    setKeyword("");
    setCustomerId("");
    setStatus("All");
    setPage(1);
  };

  const handleActionClick = (action: "pause" | "resume" | "delete", chatbot: ChatAgent) => {
    setConfirmDialog({
      isOpen: true,
      action,
      chatbot,
    });
  };

  const updateMutation = useChatAgentsControllerUpdate({ mutation: {
    onSuccess: () => {
      if (confirmDialog.chatbot) {
        queryClient.invalidateQueries({ queryKey: ["http://localhost:3000/chat-agents"] });
      }
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    },
  }} as any);
  const deleteMutation = useChatAgentsControllerRemove({ mutation: {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["http://localhost:3000/chat-agents"] });
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    },
  }} as any);

  const handleConfirmAction = () => {
    if (!confirmDialog.chatbot) return;
    const bot = confirmDialog.chatbot;
    if (confirmDialog.action === "delete") {
      deleteMutation.mutate({ id: bot.id } as any);
      return;
    }
    const newActive = confirmDialog.action === "resume";
    updateMutation.mutate({ id: bot.id, data: { isActive: newActive } } as any);
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
          <li className="text-foreground">Chatbots</li>
        </ol>
      </nav>

      {/* Title + Action */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold md:text-2xl">Chatbots</h1>
        <Link
          href="/admin/chatbots/new"
          className={
            cn(
              "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground",
              "border border-primary shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )
          }
        >
          <Plus className="h-4 w-4" />
          New Chatbot
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
          value={customerId}
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
              <th className="px-3 py-3 text-left font-medium">TITLE</th>
              <th className="px-3 py-3 text-left font-medium">CUSTOMER</th>
              <th className="px-3 py-3 text-left font-medium">LAST UPDATE</th>
              <th className="px-3 py-3 text-left font-medium">STATUS</th>
              <th className="px-3 py-3 text-left font-medium">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {rows.filter((r) => (status === "All" ? true : r.isActive === (status === "Active"))).length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                  No data
                </td>
              </tr>
            ) : (
              rows
                .filter((r) => (status === "All" ? true : r.isActive === (status === "Active")))
                .map((b, idx) => (
                <tr key={b.id} className="border-t">
                  <td className="px-3 py-3">{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td className="px-3 py-3">{b.name}</td>
                  <td className="px-3 py-3">{customers.find((c) => c.id === b.customerId)?.name ?? b.customerId}</td>
                  <td className="px-3 py-3">{new Date(b.updatedAt).toLocaleDateString()}</td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          b.isActive ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-700"
                        )
                      }
                    >
                      {b.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="inline-flex overflow-hidden rounded-md border">
                      <Link
                        href={`/admin/chatbots/detail/${b.id}`}
                        className="p-2.5 hover:bg-muted"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      {b.isActive ? (
                        <button
                          onClick={() => handleActionClick("pause", b)}
                          className="border-l p-2.5 hover:bg-muted"
                          aria-label="Pause"
                          title="Pause"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActionClick("resume", b)}
                          className="border-l p-2.5 hover:bg-muted"
                          aria-label="Resume"
                          title="Resume"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleActionClick("delete", b)}
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
          Page {currentPage} of {totalPages} • {rows.length} items {isFetching ? "(loading...)" : ""}
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
        message={`Are you sure to ${confirmDialog.action} ${confirmDialog.chatbot?.name}?`}
        confirmText="OK"
        cancelText="Cancel"
        variant={confirmDialog.action === "delete" ? "destructive" : "default"}
      />
    </div>
  );
}

export default AdminChatbots;