"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { faker } from "@faker-js/faker";
import { Pencil, Pause, Play, Trash2, Plus } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

type ChannelPlatform =
  | "Slack"
  | "Lark"
  | "Microsoft Team"
  | "WhatsApp Business API"
  | "Shopify"
  | "WordPress"
  | "Discord"
  | "Telegram";

type ChannelRow = {
  id: string;
  chatbotTitle: string;
  platform: ChannelPlatform;
  chats24h: number; // 50..2000
  status: "Active" | "Inactive";
};

const PLATFORM_OPTIONS: ChannelPlatform[] = [
  "Slack",
  "Lark",
  "Microsoft Team",
  "WhatsApp Business API",
  "Shopify",
  "WordPress",
  "Discord",
  "Telegram",
];

// Generate sample chatbots (names should mirror AdminChatbots style)
const SAMPLE_CHATBOTS: string[] = (() => {
  const names = new Set<string>();
  while (names.size < 80) {
    names.add(faker.commerce.productName());
  }
  return Array.from(names);
})();

const sampleChannels: ChannelRow[] = (() => {
  const rows: ChannelRow[] = [];
  for (let i = 0; i < 500; i++) {
    const isActive = faker.number.int({ min: 0, max: 100 }) < 70;
    rows.push({
      id: faker.string.uuid(),
      chatbotTitle: faker.helpers.arrayElement(SAMPLE_CHATBOTS),
      platform: faker.helpers.arrayElement(PLATFORM_OPTIONS),
      chats24h: faker.number.int({ min: 50, max: 2000 }),
      status: isActive ? "Active" : "Inactive",
    });
  }
  return rows;
})();

function formatChatsShort(value: number) {
  if (value < 100) {
    const flooredToTen = Math.floor(value / 10) * 10;
    return `${flooredToTen}+`;
  }
  const flooredToHundred = Math.floor(value / 100) * 100;
  return `${flooredToHundred}+`;
}

function AdminChannels() {
  const [chatbot, setChatbot] = useState<string>("All");
  const [channel, setChannel] = useState<"All" | ChannelPlatform>("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const chatbotOptions = useMemo(() => {
    return Array.from(new Set(sampleChannels.map((r) => r.chatbotTitle))).sort();
  }, []);

  const filtered = useMemo(() => {
    return sampleChannels.filter((r) => {
      const matchChatbot = chatbot === "All" ? true : r.chatbotTitle === chatbot;
      const matchChannel = channel === "All" ? true : r.platform === channel;
      return matchChatbot && matchChannel;
    });
  }, [chatbot, channel]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetFilters = () => {
    setChatbot("All");
    setChannel("All");
    setPage(1);
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
          href="#"
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
          {chatbotOptions.map((name) => (
            <option key={name} value={name}>{name}</option>
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
              <th className="px-3 py-3 text-left font-medium">CHATBOT</th>
              <th className="px-3 py-3 text-left font-medium">CHANNEL</th>
              <th className="px-3 py-3 text-left font-medium">CHATS 24hrs</th>
              <th className="px-3 py-3 text-left font-medium">STATUS</th>
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
                  <td className="px-3 py-3">{r.chatbotTitle}</td>
                  <td className="px-3 py-3">{r.platform}</td>
                  <td className="px-3 py-3">{formatChatsShort(r.chats24h)}</td>
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
                      <button
                        className="p-2.5 hover:bg-muted"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {r.status === "Active" ? (
                        <button
                          className="border-l p-2.5 hover:bg-muted"
                          aria-label="Pause"
                          title="Pause"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          className="border-l p-2.5 hover:bg-muted"
                          aria-label="Resume"
                          title="Resume"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      <button
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
    </div>
  );
}

export default AdminChannels;