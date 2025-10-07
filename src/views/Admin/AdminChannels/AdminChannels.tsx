"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Pencil, Pause, Play, Trash2, Plus, RotateCcw } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useChannelsControllerFindAll, useChannelsControllerRemove, useChannelsControllerUpdate, getChannelsControllerFindAllQueryKey } from "@/sdk/channels/channels";
import { useChatAgentsControllerFindAll } from "@/sdk/chat-agents/chat-agents";
import type { Channel as ApiChannel, ChannelPlatform } from "@/sdk/models";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type UiChannel = {
  id: string;
  name: string;
  chatAgentId: string;
  chatAgentName: string;
  platform: ChannelPlatform;
  workspaceId: string;
  status: "Active" | "Inactive";
};

const PLATFORM_OPTIONS: ChannelPlatform[] = [
  "slack",
  "discord", 
  "teams",
  "lark",
  "telegram",
  "whatsapp",
];

function AdminChannels() {
  const [chatbot, setChatbot] = useState<string>("All");
  const [channel, setChannel] = useState<"All" | ChannelPlatform>("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "pause" | "resume" | "delete";
    channel: UiChannel | null;
  }>({
    isOpen: false,
    action: "pause",
    channel: null,
  });

  const queryClient = useQueryClient();

  const apiIsActive = useMemo(() => {
    return ""; // We'll filter by status in the UI for now
  }, []);

  const skip = useMemo(() => Math.max(0, (page - 1) * pageSize), [page, pageSize]);
  const take = pageSize;

  const { data, isLoading, isError, refetch, isFetching } = useChannelsControllerFindAll(
    {
      skip,
      take,
      search: "",
      platform: channel === "All" ? "" : channel,
      chatAgentId: chatbot === "All" ? "" : chatbot,
      isActive: apiIsActive,
    },
    {
      query: {},
    }
  );

  // Get chat agents for the dropdown
  const { data: chatAgentsData } = useChatAgentsControllerFindAll(
    {
      skip: 0,
      take: 1000,
      search: "",
      customerId: "",
    },
    {
      query: {},
    }
  );

  const updateMutation = useChannelsControllerUpdate({
    mutation: {
      onSuccess: async () => {
        toast.success("Channel status updated", { duration: 2000 });
        await queryClient.invalidateQueries({ queryKey: getChannelsControllerFindAllQueryKey({
          skip,
          take,
          search: "",
          platform: channel === "All" ? "" : channel,
          chatAgentId: chatbot === "All" ? "" : chatbot,
          isActive: apiIsActive,
        }) as unknown as any });
        refetch();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to update channel";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  const deleteMutation = useChannelsControllerRemove({
    mutation: {
      onSuccess: async () => {
        toast.success("Channel deleted", { duration: 2000 });
        await queryClient.invalidateQueries({ queryKey: getChannelsControllerFindAllQueryKey({
          skip,
          take,
          search: "",
          platform: channel === "All" ? "" : channel,
          chatAgentId: chatbot === "All" ? "" : chatbot,
          isActive: apiIsActive,
        }) as unknown as any });
        refetch();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to delete channel";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  const apiChannels: UiChannel[] = useMemo(() => {
    const rows = (data?.data ?? []) as ApiChannel[];
    const chatAgents = (chatAgentsData?.data ?? []);
    
    return rows.map((row) => {
      const chatAgent = chatAgents.find(agent => agent.id === row.chatAgentId);
      return {
        id: row.id,
        name: row.name,
        chatAgentId: row.chatAgentId,
        chatAgentName: chatAgent?.name || "Unknown",
        platform: row.platform,
        workspaceId: row.workspaceId,
        status: row.isActive ? "Active" : "Inactive",
      };
    });
  }, [data, chatAgentsData]);

  const chatbotOptions = useMemo(() => {
    const chatAgents = (chatAgentsData?.data ?? []);
    return chatAgents.map(agent => ({ id: agent.id, name: agent.name }));
  }, [chatAgentsData]);

  const currentPage = page;
  const hasNextPage = apiChannels.length === pageSize;
  const totalPages = Math.max(1, currentPage + (hasNextPage ? 1 : 0));

  const resetFilters = () => {
    setChatbot("All");
    setChannel("All");
    setPage(1);
  };

  const handleActionClick = (action: "pause" | "resume" | "delete", channel: UiChannel) => {
    setConfirmDialog({
      isOpen: true,
      action,
      channel,
    });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.channel) return;
    
    if (confirmDialog.action === "delete") {
      deleteMutation.mutate({ id: confirmDialog.channel.id });
      return;
    }

    const shouldActivate = confirmDialog.action === "resume";
    updateMutation.mutate({ 
      id: confirmDialog.channel.id, 
      data: { isActive: shouldActivate } 
    });
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
          <li className="text-foreground">Channels</li>
        </ol>
      </nav>

      {/* Title + Action */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold md:text-2xl">Channels</h1>
        <Link
          href="/admin/channels/new"
          className={
            cn(
              "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground",
              "border border-primary shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )
          }
        >
          <Plus className="h-4 w-4" />
          New Channel
        </Link>
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
          {chatbotOptions.map((agent) => (
            <option key={agent.id} value={agent.id}>{agent.name}</option>
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
          <option value="All">All Platforms</option>
          {PLATFORM_OPTIONS.map((p) => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
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
          <div className="p-6 text-sm text-muted-foreground">Loading channels…</div>
        ) : isError ? (
          <div className="p-6 text-sm text-red-600">Failed to load channels.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-3 text-left font-medium">NO</th>
                <th className="px-3 py-3 text-left font-medium">NAME</th>
                <th className="px-3 py-3 text-left font-medium">CHATBOT</th>
                <th className="px-3 py-3 text-left font-medium">PLATFORM</th>
                <th className="px-3 py-3 text-left font-medium">WORKSPACE ID</th>
                <th className="px-3 py-3 text-left font-medium">STATUS</th>
                <th className="px-3 py-3 text-left font-medium">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {apiChannels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                    No data
                  </td>
                </tr>
              ) : (
                apiChannels.map((r, idx) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-3">{(currentPage - 1) * pageSize + idx + 1}</td>
                    <td className="px-3 py-3">{r.name}</td>
                    <td className="px-3 py-3">{r.chatAgentName}</td>
                    <td className="px-3 py-3">{r.platform.charAt(0).toUpperCase() + r.platform.slice(1)}</td>
                    <td className="px-3 py-3">{r.workspaceId}</td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            r.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-700"
                          )
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="inline-flex overflow-hidden rounded-md border">
                        <Link
                          href={`/admin/channels/edit/${r.id}`}
                          className="p-2.5 hover:bg-muted"
                          aria-label="Edit"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        {r.status === "Active" ? (
                          <button
                            onClick={() => handleActionClick("pause", r)}
                            className="border-l p-2.5 hover:bg-muted"
                            aria-label="Pause"
                            title="Pause"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActionClick("resume", r)}
                            className="border-l p-2.5 hover:bg-muted"
                            aria-label="Resume"
                            title="Resume"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleActionClick("delete", r)}
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
          Page {currentPage} of {totalPages} • {apiChannels.length} items
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
        message={`Are you sure to ${confirmDialog.action} ${confirmDialog.channel?.name} channel?`}
        confirmText={updateMutation.isPending || deleteMutation.isPending ? "Working..." : "OK"}
        cancelText="Cancel"
        variant={confirmDialog.action === "delete" ? "destructive" : "default"}
      />
    </div>
  );
}

export default AdminChannels;