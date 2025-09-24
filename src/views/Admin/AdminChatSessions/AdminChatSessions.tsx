"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Eye, Trash2, RotateCcw } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useChatSessionsControllerFindAll, useChatSessionsControllerRemove } from "@/sdk/chat-sessions/chat-sessions";
import { useChatAgentsControllerFindAll } from "@/sdk/chat-agents/chat-agents";
import { useCustomersControllerFindAll } from "@/sdk/customers/customers";

type ChannelPlatform =
  | "Slack"
  | "Shopify"
  | "WhatsApp Business API"
  | "WordPress"
  | "Lark";

type ChatSessionRow = {
  id: string;
  chatAgentId: string;
  chatAgentName: string;
  platform: ChannelPlatform;
  customerName: string;
  initiatedAt: Date;
};

const PLATFORM_OPTIONS: ChannelPlatform[] = [
  "Slack",
  "Shopify",
  "WhatsApp Business API",
  "WordPress",
  "Lark",
];

// data is loaded from SDK hooks below

function formatInitiatedAt(date: Date) {
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

function AdminChatSessions() {
  const router = useRouter();
  const [chatbot, setChatbot] = useState<string>("All");
  const [channel, setChannel] = useState<"All" | ChannelPlatform>("All");
  const [customer, setCustomer] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "delete";
    session: ChatSessionRow | null;
  }>({
    isOpen: false,
    action: "delete",
    session: null,
  });

  // fetch dropdown data
  const { data: agentsResp } = useChatAgentsControllerFindAll({ skip: 0, take: 1000, search: "", customerId: "" });
  const agents = agentsResp?.data ?? [];
  const { data: customersResp } = useCustomersControllerFindAll({ skip: 0, take: 1000, search: "", industry: "", isActive: "" });
  const customers = customersResp?.data ?? [];

  const agentIdToName = useMemo(() => {
    const m = new Map<string, string>();
    agents.forEach(a => m.set(a.id, a.name));
    return m;
  }, [agents]);

  // fetch sessions (client-side filtered/paginated)
  const { data: sessionsResp, refetch } = useChatSessionsControllerFindAll({
    skip: 0,
    take: 1000,
    search: "",
    chatAgentId: chatbot === "All" ? "" : chatbot,
    customerStaffId: "",
    platform: channel === "All" ? "" : channel,
    status: "",
  });
  const sessions = sessionsResp?.data ?? [];

  const chatbotOptions = useMemo(() => {
    return agents.map(a => ({ id: a.id, name: a.name }));
  }, [agents]);

  const customerOptions = useMemo(() => {
    return customers.map(c => c.name).sort();
  }, [customers]);

  const filtered = useMemo(() => {
    const rows: ChatSessionRow[] = sessions.map(s => ({
      id: s.id,
      chatAgentId: s.chatAgentId,
      chatAgentName: agentIdToName.get(s.chatAgentId) ?? "-",
      platform: s.platform as unknown as ChannelPlatform,
      customerName: "",
      initiatedAt: new Date(s.createdAt),
    }));

    return rows.filter((r) => {
      const matchChatbot = chatbot === "All" ? true : r.chatAgentId === chatbot;
      const matchChannel = channel === "All" ? true : r.platform === channel;
      const matchCustomer = customer === "" ? true : r.customerName === customer;
      return matchChatbot && matchChannel && matchCustomer;
    });
  }, [sessions, agentIdToName, chatbot, channel, customer]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetFilters = () => {
    setChatbot("All");
    setChannel("All");
    setCustomer("");
    setPage(1);
  };

  const handleViewClick = (session: ChatSessionRow) => {
    router.push(`/admin/chat-sessions/edit/${session.id}`);
  };

  const handleDeleteClick = (session: ChatSessionRow) => {
    setConfirmDialog({
      isOpen: true,
      action: "delete",
      session,
    });
  };

  const { mutateAsync: removeSession, isPending: isDeleting } = useChatSessionsControllerRemove({});

  const handleConfirmAction = async () => {
    if (!confirmDialog.session) return;
    try {
      await removeSession({ id: confirmDialog.session.id });
      await refetch();
    } finally {
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
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
          <li className="text-foreground">Chat Sessions</li>
        </ol>
      </nav>

      {/* Title + Action */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold md:text-2xl">Chat Sessions</h1>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 rounded-md border bg-white p-3 md:p-4">
        <select
          value={chatbot}
          onChange={(e) => {
            setPage(1);
            setChatbot(e.target.value);
          }}
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
        >
          <option value="All">All Chatbots</option>
          {chatbotOptions.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <select
          value={channel}
          onChange={(e) => {
            setPage(1);
            setChannel(e.target.value as any);
          }}
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
        >
          <option value="All">All Channels</option>
          {PLATFORM_OPTIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={customer}
          onChange={(e) => {
            setPage(1);
            setCustomer(e.target.value);
          }}
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
        >
          <option value="">All Customers</option>
          {customerOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
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
              <th className="px-3 py-3 text-left font-medium">CHATBOT</th>
              <th className="px-3 py-3 text-left font-medium">CHANNEL</th>
              <th className="px-3 py-3 text-left font-medium">CUSTOMER</th>
              <th className="px-3 py-3 text-left font-medium">INITIATED AT</th>
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
              paged.map((r, idx) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-3">{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td className="px-3 py-3">{r.chatAgentName}</td>
                  <td className="px-3 py-3">{r.platform}</td>
                  <td className="px-3 py-3">{r.customerName || '-'}</td>
                  <td className="px-3 py-3">{formatInitiatedAt(r.initiatedAt)}</td>
                  <td className="px-3 py-3">
                    <div className="inline-flex overflow-hidden rounded-md border">
                      <button
                        onClick={() => handleViewClick(r)}
                        className="p-2.5 hover:bg-muted"
                        aria-label="View"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(r)}
                        className="border-l p-2.5 text-red-600 hover:bg-muted"
                        aria-label="Delete"
                        title="Delete"
                        disabled={isDeleting}
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
        message={`Are you sure to ${confirmDialog.action} this chat session?`}
        confirmText="OK"
        cancelText="Cancel"
        variant={confirmDialog.action === "delete" ? "destructive" : "default"}
      />
    </div>
  );
}

export default AdminChatSessions;