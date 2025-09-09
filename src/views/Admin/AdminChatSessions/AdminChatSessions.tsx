"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { faker } from "@faker-js/faker";
import { Eye, Trash2 } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

type ChannelPlatform =
  | "Slack"
  | "Shopify"
  | "WhatsApp Business API"
  | "WordPress"
  | "Lark";

type ChatSessionRow = {
  id: string;
  chatbotTitle: string;
  platform: ChannelPlatform;
  customerCompany: string;
  initiatedAt: Date;
};

const PLATFORM_OPTIONS: ChannelPlatform[] = [
  "Slack",
  "Shopify",
  "WhatsApp Business API",
  "WordPress",
  "Lark",
];

// Generate sample chatbots (names mirror AdminChatbots style)
const SAMPLE_CHATBOTS: string[] = (() => {
  const names = new Set<string>();
  while (names.size < 80) {
    names.add(faker.commerce.productName());
  }
  return Array.from(names);
})();

const sampleChatSessions: ChatSessionRow[] = (() => {
  const rows: ChatSessionRow[] = [];
  for (let i = 0; i < 500; i++) {
    rows.push({
      id: faker.string.uuid(),
      chatbotTitle: faker.helpers.arrayElement(SAMPLE_CHATBOTS),
      platform: faker.helpers.arrayElement(PLATFORM_OPTIONS),
      customerCompany: faker.company.name(),
      initiatedAt: faker.date.past({ years: 1 }),
    });
  }
  return rows;
})();

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
  const [chatbot, setChatbot] = useState<string>("All");
  const [channel, setChannel] = useState<"All" | ChannelPlatform>("All");
  const [customer, setCustomer] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const chatbotOptions = useMemo(() => {
    return Array.from(new Set(sampleChatSessions.map((r) => r.chatbotTitle))).sort();
  }, []);

  const customerOptions = useMemo(() => {
    return Array.from(new Set(sampleChatSessions.map((r) => r.customerCompany))).sort();
  }, []);

  const filtered = useMemo(() => {
    return sampleChatSessions.filter((r) => {
      const matchChatbot = chatbot === "All" ? true : r.chatbotTitle === chatbot;
      const matchChannel = channel === "All" ? true : r.platform === channel;
      const matchCustomer = customer === "" ? true : r.customerCompany === customer;
      return matchChatbot && matchChannel && matchCustomer;
    });
  }, [chatbot, channel, customer]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetFilters = () => {
    setChatbot("All");
    setChannel("All");
    setCustomer("");
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
        <div>
          <input
            type="text"
            list="customer-options"
            value={customer}
            onChange={(e) => {
              setPage(1);
              setCustomer(e.target.value);
            }}
            placeholder="Select Customer..."
            className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
          />
          <datalist id="customer-options">
            {customerOptions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
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
                  <td className="px-3 py-3">{r.chatbotTitle}</td>
                  <td className="px-3 py-3">{r.platform}</td>
                  <td className="px-3 py-3">{r.customerCompany}</td>
                  <td className="px-3 py-3">{formatInitiatedAt(r.initiatedAt)}</td>
                  <td className="px-3 py-3">
                    <div className="inline-flex overflow-hidden rounded-md border">
                      <button
                        className="p-2.5 hover:bg-muted"
                        aria-label="View"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
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

export default AdminChatSessions;