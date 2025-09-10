"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { faker } from "@faker-js/faker";
import { Pencil, Pause, Play, Trash2 } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

type ChannelPlatform =
  | "Slack"
  | "Microsoft Team"
  | "Lark"
  | "Discord"
  | "Shopify"
  | "WordPress";

type ChannelRow = {
  id: string;
  company: string;
  platform: ChannelPlatform;
  version: string;
  chats24h: number;
  status: "Active" | "Inactive";
};

const PLATFORM_OPTIONS: ChannelPlatform[] = [
  "Slack",
  "Microsoft Team",
  "Lark",
  "Discord",
  "Shopify",
  "WordPress",
];

const VERSION_OPTIONS: string[] = ["v2025.09.1", "v2025.10.1"];

const sampleChannels: ChannelRow[] = (() => {
  const rows: ChannelRow[] = [];
  for (let i = 0; i < 20; i++) {
    const isActive = faker.number.int({ min: 0, max: 100 }) < 70;
    rows.push({
      id: faker.string.uuid(),
      company: faker.company.name(),
      platform: faker.helpers.arrayElement(PLATFORM_OPTIONS),
      version: faker.helpers.arrayElement(VERSION_OPTIONS),
      chats24h: faker.number.int({ min: 10, max: 4000 }),
      status: isActive ? "Active" : "Inactive",
    });
  }
  return rows;
})();

function formatChatsShort(value: number) {
  if (value < 50) {
    const flooredToTen = Math.floor(value / 10) * 10;
    return `${flooredToTen}+`;
  }
  if (value < 200) {
    const flooredToFifty = Math.floor(value / 50) * 50;
    return `${flooredToFifty}+`;
  }
  if (value < 3100) {
    const flooredToHundred = Math.floor(value / 100) * 100;
    return `${flooredToHundred}+`;
  }
  const flooredToHundred0 = Math.floor(value / 100) * 100;
  return `${flooredToHundred0}+`;
}

function AdminChatbotDetailChannelsTab() {
  const [customer, setCustomer] = useState<string>("All");
  const [type, setType] = useState<"All" | ChannelPlatform>("All");
  const [status, setStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "pause" | "resume" | "delete";
    channel: ChannelRow | null;
  }>({
    isOpen: false,
    action: "pause",
    channel: null,
  });

  const rows = useMemo(() => sampleChannels, []);

  const customerOptions = useMemo(() => {
    return Array.from(new Set(rows.map((r) => r.company))).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchCustomer = customer === "All" ? true : r.company === customer;
      const matchType = type === "All" ? true : r.platform === type;
      const matchStatus = status === "All" ? true : r.status === status;
      return matchCustomer && matchType && matchStatus;
    });
  }, [rows, customer, type, status]);

  const handleActionClick = (action: "pause" | "resume" | "delete", channel: ChannelRow) => {
    setConfirmDialog({ isOpen: true, action, channel });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.channel) return;
    console.log(`${confirmDialog.action} channel:`, confirmDialog.channel);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 rounded-md border bg-white p-3 md:p-4">
        <select
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
        >
          <option value="All">All Customers</option>
          {customerOptions.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
        >
          <option value="All">All Types</option>
          {PLATFORM_OPTIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-3 text-left font-medium">NO</th>
              <th className="px-3 py-3 text-left font-medium">CUSTOMER</th>
              <th className="px-3 py-3 text-left font-medium">TYPE</th>
              <th className="px-3 py-3 text-left font-medium">VERSION</th>
              <th className="px-3 py-3 text-left font-medium">CHAT 24hrs</th>
              <th className="px-3 py-3 text-left font-medium">STATUS</th>
              <th className="px-3 py-3 text-left font-medium">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r, idx) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-3">{idx + 1}</td>
                <td className="px-3 py-3">{r.company}</td>
                <td className="px-3 py-3">{r.platform}</td>
                <td className="px-3 py-3">{r.version}</td>
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
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title="Confirm Action"
        message={`Are you sure to ${confirmDialog.action} this channel?`}
        confirmText="OK"
        cancelText="Cancel"
        variant={confirmDialog.action === "delete" ? "destructive" : "default"}
      />
    </div>
  );
}

export default AdminChatbotDetailChannelsTab;

