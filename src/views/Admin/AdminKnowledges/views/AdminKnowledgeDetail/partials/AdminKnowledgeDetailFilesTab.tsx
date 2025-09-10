"use client";

import { useMemo, useState } from "react";
import { FileText, Download, Trash2, Edit, RotateCcw } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { cn } from "@/lib/utils";
import { faker } from "@faker-js/faker";

type KnowledgeFile = {
  id: string;
  name: string;
  tokens: string;
  uploadedAt: string;
  status: "Error" | "Pending" | "Processing" | "Processed";
};

const sampleFiles: KnowledgeFile[] = (() => {
  const rows: KnowledgeFile[] = [];
  const fileExtensions = ["pdf", "docx", "pptx", "txt"];
  const statuses: KnowledgeFile["status"][] = ["Error", "Pending", "Processing", "Processed"];
  const tokenRanges = ["10+", "50+", "100+", "300+", "500+", "800+", "1200+", "2000+"];
  
  for (let i = 0; i < 150; i++) {
    const ext = faker.helpers.arrayElement(fileExtensions);
    const status = faker.helpers.arrayElement(statuses);
    const tokens = faker.helpers.arrayElement(tokenRanges);
    
    rows.push({
      id: faker.string.uuid(),
      name: `${faker.lorem.words(2).replace(/\s/g, '-')}.${ext}`,
      tokens,
      uploadedAt: faker.date.recent({ days: 30 }).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      status,
    });
  }
  return rows;
})();

function AdminKnowledgeDetailFilesTab() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"All" | "Error" | "Pending" | "Processing" | "Processed">("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "delete";
    file: KnowledgeFile | null;
  }>({
    isOpen: false,
    action: "delete",
    file: null,
  });

  const filtered = useMemo(() => {
    return sampleFiles.filter((file) => {
      const matchKeyword = file.name.toLowerCase().includes(keyword.toLowerCase());
      const matchStatus = status === "All" ? true : file.status === status;
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

  const handleActionClick = (action: "delete", file: KnowledgeFile) => {
    setConfirmDialog({
      isOpen: true,
      action,
      file,
    });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.file) return;
    
    // Here you would typically make an API call
    console.log(`${confirmDialog.action} file:`, confirmDialog.file);
    
    // For demo purposes, we'll just log the action
    // In a real app, you'd delete the file
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 rounded-md border bg-white p-3 md:p-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => {
            setPage(1);
            setKeyword(e.target.value);
          }}
          placeholder="Search files..."
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
          <option value="Error">Error</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Processed">Processed</option>
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
              <th className="px-3 py-3 text-left font-medium">FILE NAME</th>
              <th className="px-3 py-3 text-left font-medium">TOKENS</th>
              <th className="px-3 py-3 text-left font-medium">UPLOADED AT</th>
              <th className="px-3 py-3 text-left font-medium">STATUS</th>
              <th className="px-3 py-3 text-left font-medium">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                  No files found
                </td>
              </tr>
            ) : (
              paged.map((file, idx) => (
                <tr key={file.id} className="border-t">
                  <td className="px-3 py-3">{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">{file.tokens}</td>
                  <td className="px-3 py-3">{file.uploadedAt}</td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        file.status === "Processed" 
                          ? "bg-emerald-100 text-emerald-700"
                          : file.status === "Processing"
                          ? "bg-yellow-100 text-yellow-700"
                          : file.status === "Pending"
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
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages} • {filtered.length} files
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
        title="Confirm Delete"
        message={`Are you sure to delete ${confirmDialog.file?.name}?`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}

export default AdminKnowledgeDetailFilesTab;