"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { faker } from "@faker-js/faker";
import { Pencil, Pause, Play, Trash2 } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

type Knowledge = {
  id: string;
  title: string;
  lastUpdate: string;
  status: "Active" | "Inactive";
};

const sampleKnowledges: Knowledge[] = (() => {
  const rows: Knowledge[] = [];
  for (let i = 0; i < 48; i++) {
    const isActive = faker.number.int({ min: 0, max: 100 }) < 70;
    const randomDate = faker.date.between({ from: new Date(2023, 0, 1), to: new Date() });
    const lastUpdate = new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    }).format(randomDate);
    rows.push({
      id: faker.string.uuid(),
      title: faker.lorem.sentence({ min: 3, max: 8 }),
      lastUpdate,
      status: isActive ? "Active" : "Inactive",
    });
  }
  return rows;
})();

type Props = {
  keyword: string;
  status: "All" | "Active" | "Inactive";
  page: number;
  onPageChange: (page: number) => void;
};

function AdminChatbotDetailKnowledgesTab({ keyword, status, page, onPageChange }: Props) {
  const pageSize = 10;

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "pause" | "resume" | "delete";
    knowledge: Knowledge | null;
  }>({
    isOpen: false,
    action: "pause",
    knowledge: null,
  });

  const filtered = useMemo(() => {
    return sampleKnowledges.filter((k) => {
      const matchKeyword = k.title.toLowerCase().includes(keyword.toLowerCase());
      const matchStatus = status === "All" ? true : k.status === status;
      return matchKeyword && matchStatus;
    });
  }, [keyword, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleActionClick = (action: "pause" | "resume" | "delete", knowledge: Knowledge) => {
    setConfirmDialog({
      isOpen: true,
      action,
      knowledge,
    });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.knowledge) return;
    // TODO: Integrate with link/unlink knowledge APIs for this chatbot
    console.log(`${confirmDialog.action} knowledge:`, confirmDialog.knowledge);
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-3 text-left font-medium">NO</th>
              <th className="px-3 py-3 text-left font-medium">TITLE</th>
              <th className="px-3 py-3 text-left font-medium">LAST UPDATE</th>
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
              paged.map((k, idx) => (
                <tr key={k.id} className="border-t">
                  <td className="px-3 py-3">{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td className="px-3 py-3">{k.title}</td>
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
                      {k.status === "Active" ? (
                        <button
                          onClick={() => handleActionClick("pause", k)}
                          className="border-l p-2.5 hover:bg-muted"
                          aria-label="Pause"
                          title="Pause"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActionClick("resume", k)}
                          className="border-l p-2.5 hover:bg-muted"
                          aria-label="Resume"
                          title="Resume"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleActionClick("delete", k)}
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
        title="Confirm Action"
        message={`Are you sure to ${confirmDialog.action} ${confirmDialog.knowledge?.title}?`}
        confirmText="OK"
        cancelText="Cancel"
        variant={confirmDialog.action === "delete" ? "destructive" : "default"}
      />
    </div>
  );
}

export default AdminChatbotDetailKnowledgesTab;

