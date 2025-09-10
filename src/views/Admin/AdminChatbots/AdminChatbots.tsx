"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { faker } from "@faker-js/faker";
import { Pencil, Pause, Play, Trash2, Plus } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

type Chatbot = {
  id: string;
  title: string;
  platform: ChatbotPlatform;
  channelsCount: number; // 1..5
  knowledgesCount: number; // 1..5
  lastUpdate: string;
  status: "Active" | "Inactive";
};

type ChatbotPlatform =
  | "Slack"
  | "Lark"
  | "Microsoft Team"
  | "Shopify"
  | "WordPress"
  | "Discord"
  | "Telegram"
  | "WhatsApp";

const PLATFORM_OPTIONS: ChatbotPlatform[] = [
  "Slack",
  "Lark",
  "Microsoft Team",
  "Shopify",
  "WordPress",
  "Discord",
  "Telegram",
  "WhatsApp",
];

const sampleChatbots: Chatbot[] = (() => {
  const rows: Chatbot[] = [];
  for (let i = 0; i < 500; i++) {
    const isActive = faker.number.int({ min: 0, max: 100 }) < 70;
    const randomDate = faker.date.between({ from: new Date(2023, 0, 1), to: new Date() });
    const lastUpdate = new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    }).format(randomDate);
    rows.push({
      id: faker.string.uuid(),
      title: faker.commerce.productName(),
      platform: faker.helpers.arrayElement(PLATFORM_OPTIONS),
      channelsCount: faker.number.int({ min: 1, max: 5 }),
      knowledgesCount: faker.number.int({ min: 1, max: 5 }),
      lastUpdate,
      status: isActive ? "Active" : "Inactive",
    });
  }
  return rows;
})();

function AdminChatbots() {
  const [keyword, setKeyword] = useState("");
  const [platform, setPlatform] = useState<"All" | ChatbotPlatform>("All");
  const [status, setStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "pause" | "resume" | "delete";
    chatbot: Chatbot | null;
  }>({
    isOpen: false,
    action: "pause",
    chatbot: null,
  });

  const filtered = useMemo(() => {
    return sampleChatbots.filter((b) => {
      const matchKeyword = b.title.toLowerCase().includes(keyword.toLowerCase());
      const matchPlatform = platform === "All" ? true : b.platform === platform;
      const matchStatus = status === "All" ? true : b.status === status;
      return matchKeyword && matchPlatform && matchStatus;
    });
  }, [keyword, platform, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetFilters = () => {
    setKeyword("");
    setPlatform("All");
    setStatus("All");
    setPage(1);
  };

  const handleActionClick = (action: "pause" | "resume" | "delete", chatbot: Chatbot) => {
    setConfirmDialog({
      isOpen: true,
      action,
      chatbot,
    });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.chatbot) return;
    
    // Here you would typically make an API call
    console.log(`${confirmDialog.action} chatbot:`, confirmDialog.chatbot);
    
    // For demo purposes, we'll just log the action
    // In a real app, you'd update the chatbot status or delete the chatbot
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
          href="#"
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
          value={platform}
          onChange={(e) => {
            setPage(1);
            setPlatform(e.target.value as any);
          }}
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
        >
          <option value="All">All Channels</option>
          {PLATFORM_OPTIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
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
              <th className="px-3 py-3 text-left font-medium">CHANNEL</th>
              <th className="px-3 py-3 text-left font-medium">CHANNELS</th>
              <th className="px-3 py-3 text-left font-medium">KNOWLEDGES</th>
              <th className="px-3 py-3 text-left font-medium">LAST UPDATE</th>
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
              paged.map((b, idx) => (
                <tr key={b.id} className="border-t">
                  <td className="px-3 py-3">{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td className="px-3 py-3">{b.title}</td>
                  <td className="px-3 py-3">{b.platform}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
                      {b.channelsCount}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
                      {b.knowledgesCount}
                    </span>
                  </td>
                  <td className="px-3 py-3">{b.lastUpdate}</td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          b.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-700"
                        )
                      }
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="inline-flex overflow-hidden rounded-md border">
                      <button
                        className="p-2.5 hover:bg-muted"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {b.status === "Active" ? (
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
        message={`Are you sure to ${confirmDialog.action} ${confirmDialog.chatbot?.title}?`}
        confirmText="OK"
        cancelText="Cancel"
        variant={confirmDialog.action === "delete" ? "destructive" : "default"}
      />
    </div>
  );
}

export default AdminChatbots;