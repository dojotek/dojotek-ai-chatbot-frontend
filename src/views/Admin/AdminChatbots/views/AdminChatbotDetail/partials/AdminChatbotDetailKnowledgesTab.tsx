"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useChatAgentKnowledgesControllerFindByChatAgent, useChatAgentKnowledgesControllerRemove, useChatAgentKnowledgesControllerCreate } from "@/sdk/chat-agent-knowledges/chat-agent-knowledges";
import { useKnowledgesControllerFindAll } from "@/sdk/knowledges/knowledges";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type KnowledgeRow = {
  id: string;
  name: string;
  lastUpdate: string;
  status: "Active" | "Inactive";
  associationId: string; // chatAgentKnowledge id (for delete)
};

type Props = {
  chatAgentId: string;
  keyword: string;
  status: "All" | "Active" | "Inactive";
  page: number;
  onPageChange: (page: number) => void;
  isAddOpen: boolean;
  onRequestCloseAdd: () => void;
};

function AdminChatbotDetailKnowledgesTab({ chatAgentId, keyword, status, page, onPageChange, isAddOpen, onRequestCloseAdd }: Props) {
  const pageSize = 10;
  const queryClient = useQueryClient();

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "delete";
    associationId: string | null;
    knowledgeName?: string;
  }>({
    isOpen: false,
    action: "delete",
    associationId: null,
    knowledgeName: "",
  });

  // Fetch linked knowledges for this chat agent
  const { data: linkedResp, isLoading: isLoadingLinked } = useChatAgentKnowledgesControllerFindByChatAgent(chatAgentId, { query: {} } as any);
  const linked = (linkedResp?.data ?? []) as any[];

  // Fetch all knowledges for selection/filtering
  const { data: allKnowledgesResp, isLoading: isLoadingAllKnowledges } = useKnowledgesControllerFindAll({ page: 1, pageSize: 1000 } as any, { query: {} } as any);
  const allKnowledges = (allKnowledgesResp?.data ?? []) as any[];

  // Build rows from linked associations
  const rows: KnowledgeRow[] = useMemo(() => {
    return linked.map((ak: any) => {
      const k = ak.knowledge;
      const updatedAt = k?.updatedAt ? new Date(k.updatedAt) : null;
      const lastUpdate = updatedAt
        ? new Intl.DateTimeFormat("en-US", { month: "long", day: "2-digit", year: "numeric" }).format(updatedAt)
        : "-";
      const isActive = k?.isActive ?? true;
      return {
        id: k?.id,
        name: k?.name ?? "Untitled",
        lastUpdate,
        status: isActive ? "Active" : "Inactive",
        associationId: ak.id,
      } as KnowledgeRow;
    });
  }, [linked]);

  const filtered = useMemo(() => {
    return rows.filter((k) => {
      const matchKeyword = k.name.toLowerCase().includes(keyword.toLowerCase());
      const matchStatus = status === "All" ? true : k.status === status;
      return matchKeyword && matchStatus;
    });
  }, [rows, keyword, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDeleteClick = (row: KnowledgeRow) => {
    setConfirmDialog({ isOpen: true, action: "delete", associationId: row.associationId, knowledgeName: row.name });
  };

  const deleteMutation = useChatAgentKnowledgesControllerRemove();

  const handleConfirmAction = async () => {
    if (!confirmDialog.associationId) return;
    try {
      await deleteMutation.mutateAsync({ id: confirmDialog.associationId } as any);
      await queryClient.invalidateQueries();
      toast.success("Knowledge removed from chatbot", { duration: 2500 });
    } catch (e) {
      const message = (e as any)?.response?.data?.message || "Failed to remove knowledge";
      toast.error(message, { duration: 3000 });
    } finally {
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    }
  };

  // Add Knowledge modal state (controlled by parent)
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<string>("");
  useEffect(() => {
    if (!isAddOpen) setSelectedKnowledgeId("");
  }, [isAddOpen]);

  const createMutation = useChatAgentKnowledgesControllerCreate();

  const alreadyLinkedIds = useMemo(() => new Set(linked.map((x: any) => x.knowledge?.id)), [linked]);
  const selectableKnowledges = useMemo(() => {
    return (allKnowledges || []).filter((k: any) => !alreadyLinkedIds.has(k.id));
  }, [allKnowledges, alreadyLinkedIds]);

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-3 text-left font-medium">NO</th>
              <th className="px-3 py-3 text-left font-medium">NAME</th>
              <th className="px-3 py-3 text-left font-medium">LAST UPDATE</th>
              <th className="px-3 py-3 text-left font-medium">STATUS</th>
              <th className="px-3 py-3 text-left font-medium">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingLinked ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">Loading...</td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                  No data
                </td>
              </tr>
            ) : (
              paged.map((k, idx) => (
                <tr key={k.associationId} className="border-t">
                  <td className="px-3 py-3">{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td className="px-3 py-3">{k.name}</td>
                  <td className="px-3 py-3">{k.lastUpdate}</td>
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
                      <button
                        onClick={() => handleDeleteClick(k)}
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
          onPageChange={(p) => onPageChange(p)
          }
          siblingCount={1}
        />
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title="Remove Knowledge"
        message={`Are you sure to remove ${confirmDialog.knowledgeName}?`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* Add Knowledge Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-md bg-background p-4 shadow-lg bg-white">
            <h3 className="text-base font-semibold mb-3">Add Knowledge</h3>
            <div className="space-y-2">
              <label className="text-sm">Select Knowledge</label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={selectedKnowledgeId}
                onChange={(e) => setSelectedKnowledgeId(e.target.value)}
                disabled={isLoadingAllKnowledges}
              >
                <option value="">-- Select --</option>
                {selectableKnowledges.map((k: any) => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                className="inline-flex items-center rounded-md border px-3 py-2 text-sm"
                onClick={onRequestCloseAdd}
              >
                Cancel
              </button>
              <button
                className={cn(
                  "inline-flex items-center rounded-md border bg-primary px-3 py-2 text-sm text-primary-foreground",
                  selectedKnowledgeId ? "opacity-100" : "opacity-60 cursor-not-allowed"
                )}
                onClick={async () => {
                  if (!selectedKnowledgeId) return;
                  try {
                    await createMutation.mutateAsync({
                      data: { chatAgentId, knowledgeId: selectedKnowledgeId, priority: 10 } as any,
                    } as any);
                    await queryClient.invalidateQueries();
                    toast.success("Knowledge added to chatbot", { duration: 2500 });
                    onRequestCloseAdd();
                  } catch (e) {
                    const message = (e as any)?.response?.data?.message || "Failed to add knowledge";
                    toast.error(message, { duration: 3000 });
                  }
                }}
                disabled={!selectedKnowledgeId || createMutation.isPending}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminChatbotDetailKnowledgesTab;

