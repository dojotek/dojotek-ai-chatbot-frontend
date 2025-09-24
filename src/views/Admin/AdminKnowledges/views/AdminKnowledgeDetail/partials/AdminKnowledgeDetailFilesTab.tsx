"use client";

import { useMemo, useState } from "react";
import { FileText, Download, Trash2, Edit, Play, Pause } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { cn } from "@/lib/utils";
import { 
  useKnowledgeFilesControllerFindByKnowledge,
  useKnowledgeFilesControllerRemove,
  useKnowledgeFilesControllerUpdate,
  getKnowledgeFilesControllerFindByKnowledgeQueryKey
} from "@/sdk/knowledge-files/knowledge-files";
import type { KnowledgeFile as ApiKnowledgeFile } from "@/sdk/models/knowledgeFile";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Props = {
  knowledgeId: string;
  keyword: string;
  status: "All" | "failed" | "pending" | "processing" | "processed";
  page: number;
  onPageChange: (page: number) => void;
  onKeywordChange: (keyword: string) => void;
  onStatusChange: (status: "All" | "failed" | "pending" | "processing" | "processed") => void;
};

function AdminKnowledgeDetailFilesTab({ knowledgeId, keyword, status, page, onPageChange, onKeywordChange, onStatusChange }: Props) {
  const pageSize = 10;
  const queryClient = useQueryClient();
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "delete" | "enable" | "disable";
    file: ApiKnowledgeFile | null;
  }>({
    isOpen: false,
    action: "delete",
    file: null,
  });

  // Fetch knowledge files
  const { data, isLoading, isError, isFetching, refetch } = useKnowledgeFilesControllerFindByKnowledge(
    knowledgeId,
    { 
      skip: (page - 1) * pageSize, 
      take: pageSize
    },
    { query: { enabled: !!knowledgeId } }
  );

  // Delete mutation
  const deleteMutation = useKnowledgeFilesControllerRemove({
    mutation: {
      onSuccess: async () => {
        toast.success("File deleted", { duration: 2000 });
        await queryClient.invalidateQueries({
          queryKey: getKnowledgeFilesControllerFindByKnowledgeQueryKey(knowledgeId, { 
            skip: (page - 1) * pageSize, 
            take: pageSize
          }) as unknown as any,
        });
        refetch();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to delete file";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  // Update mutation for enable/disable
  const updateMutation = useKnowledgeFilesControllerUpdate({
    mutation: {
      onSuccess: async () => {
        toast.success("File updated", { duration: 1500 });
        await queryClient.invalidateQueries({
          queryKey: getKnowledgeFilesControllerFindByKnowledgeQueryKey(knowledgeId, { 
            skip: (page - 1) * pageSize, 
            take: pageSize
          }) as unknown as any,
        });
        refetch();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to update file";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  const apiRows: ApiKnowledgeFile[] = data?.data ?? [];
  const currentPage = page;
  const hasNextPage = apiRows.length === pageSize;
  const totalPages = Math.max(1, currentPage + (hasNextPage ? 1 : 0));

  const handleActionClick = (action: "delete" | "enable" | "disable", file: ApiKnowledgeFile) => {
    setConfirmDialog({
      isOpen: true,
      action,
      file,
    });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.file) return;
    
    if (confirmDialog.action === "delete") {
      deleteMutation.mutate({ id: confirmDialog.file.id });
    } else if (confirmDialog.action === "enable") {
      updateMutation.mutate({ id: confirmDialog.file.id, data: { isActive: true } });
    } else if (confirmDialog.action === "disable") {
      updateMutation.mutate({ id: confirmDialog.file.id, data: { isActive: false } });
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters moved to parent */}

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        {isLoading || isFetching ? (
          <div className="p-6 text-sm text-muted-foreground">Loading files…</div>
        ) : isError ? (
          <div className="p-6 text-sm text-red-600">Failed to load files.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-3 text-left font-medium">NO</th>
                <th className="px-3 py-3 text-left font-medium">FILE NAME</th>
                <th className="px-3 py-3 text-left font-medium">TOKENS</th>
                <th className="px-3 py-3 text-left font-medium">UPLOADED AT</th>
                <th className="px-3 py-3 text-left font-medium">STATUS</th>
                <th className="px-3 py-3 text-left font-medium">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {apiRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    No files found
                  </td>
                </tr>
              ) : (
                apiRows.map((file, idx) => (
                  <tr key={file.id} className="border-t">
                    <td className="px-3 py-3">{(currentPage - 1) * pageSize + idx + 1}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{file.fileName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">{file.fileSize ? `${file.fileSize} bytes` : "N/A"}</td>
                    <td className="px-3 py-3">
                      {file.createdAt ? new Date(file.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      }) : "N/A"}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          file.status === "processed" 
                            ? "bg-emerald-100 text-emerald-700"
                            : file.status === "processing"
                            ? "bg-yellow-100 text-yellow-700"
                            : file.status === "pending"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        )}
                      >
                        {file.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="inline-flex overflow-hidden rounded-md border">
                        <button
                          className="p-2.5 hover:bg-muted"
                          aria-label="Download"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          className="border-l p-2.5 hover:bg-muted"
                          aria-label="Edit"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {file.isActive ? (
                          <button
                            onClick={() => handleActionClick("disable", file)}
                            className="border-l p-2.5 text-orange-600 hover:bg-muted"
                            aria-label="Disable"
                            title="Disable"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActionClick("enable", file)}
                            className="border-l p-2.5 text-green-600 hover:bg-muted"
                            aria-label="Enable"
                            title="Enable"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleActionClick("delete", file)}
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
          Page {currentPage} of {totalPages} • {apiRows.length} files
        </p>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          siblingCount={1}
        />
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title="Confirm Action"
        message={`Are you sure to ${confirmDialog.action} ${confirmDialog.file?.fileName}?`}
        confirmText={deleteMutation.isPending || updateMutation.isPending ? "Working..." : "OK"}
        cancelText="Cancel"
        variant={confirmDialog.action === "delete" ? "destructive" : "default"}
      />
    </div>
  );
}

export default AdminKnowledgeDetailFilesTab;