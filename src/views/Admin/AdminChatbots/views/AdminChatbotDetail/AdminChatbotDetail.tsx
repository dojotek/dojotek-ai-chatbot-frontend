"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminChatbotDetailMonitoringTab from "./partials/AdminChatbotDetailMonitoringTab";
import AdminChatbotDetailConfigurationTab from "./partials/AdminChatbotDetailConfigurationTab";
import AdminChatbotDetailKnowledgesTab from "./partials/AdminChatbotDetailKnowledgesTab";
import AdminChatbotDetailPlaygroundTab from "./partials/AdminChatbotDetailPlaygroundTab";
import AdminChatbotDetailChannelsTab from "./partials/AdminChatbotDetailChannelsTab";
import { faker } from "@faker-js/faker";

function AdminChatbotDetail() {
  const [activeTab, setActiveTab] = useState("monitoring");
  // Knowledges filters
  const [knowledgeKeyword, setKnowledgeKeyword] = useState("");
  const [knowledgeStatus, setKnowledgeStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [knowledgePage, setKnowledgePage] = useState(1);

  // Channels filters
  type ChannelPlatform = "Slack" | "Microsoft Team" | "Lark" | "Discord" | "Shopify" | "WordPress";
  const CHANNEL_PLATFORM_OPTIONS: ChannelPlatform[] = [
    "Slack",
    "Microsoft Team",
    "Lark",
    "Discord",
    "Shopify",
    "WordPress",
  ];
  const [channelCustomer, setChannelCustomer] = useState<string>("All");
  const [channelType, setChannelType] = useState<"All" | ChannelPlatform>("All");
  const [channelStatus, setChannelStatus] = useState<"All" | "Active" | "Inactive">("All");
  // Sample rows for channels and derived customer options
  type ChannelRow = {
    id: string;
    company: string;
    platform: ChannelPlatform;
    version: string;
    chats24h: number;
    status: "Active" | "Inactive";
  };
  // Generate deterministic-looking sample rows on first render
  const [channelRows] = useState<ChannelRow[]>(() => {
    // Use faker to generate sample data
    const VERSION_OPTIONS: string[] = ["v2025.09.1", "v2025.10.1"];
    const rows: ChannelRow[] = [];
    for (let i = 0; i < 20; i++) {
      const isActive = faker.number.int({ min: 0, max: 100 }) < 70;
      rows.push({
        id: faker.string.uuid(),
        company: faker.company.name(),
        platform: faker.helpers.arrayElement(CHANNEL_PLATFORM_OPTIONS),
        version: faker.helpers.arrayElement(VERSION_OPTIONS),
        chats24h: faker.number.int({ min: 10, max: 4000 }),
        status: isActive ? "Active" : "Inactive",
      });
    }
    return rows;
  });
  const channelCustomerOptions = Array.from(new Set(channelRows.map((r) => r.company))).sort();

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/admin/dashboards" className="hover:underline">Dashboard</Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/admin/chatbots" className="hover:underline">Chatbots</Link>
          </li>
          <li>/</li>
          <li className="text-foreground">Chatbot Details</li>
        </ol>
      </nav>

      {/* Header with Back Button, Title, and Conditional Action Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/chatbots"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-semibold md:text-2xl">Chatbot Details</h1>
        </div>
        {activeTab === "knowledges" && (
          <Link
            href="/admin/knowledges/new"
            className={
              cn(
                "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground",
                "border border-primary shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              )
            }
          >
            <Plus className="h-4 w-4" />
            Add Knowledge
          </Link>
        )}
        {activeTab === "channels" && (
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
            Add Channel
          </Link>
        )}
      </div>

      {/* Tabs and Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="p-4 border rounded-md">
          <div className="w-full bg-gray-200 rounded-lg">
            <TabsList className="w-full h-auto bg-transparent p-0 justify-start relative flex flex-col md:flex-row gap-1 md:gap-0">
              <TabsTrigger 
                value="monitoring" 
                className="w-full md:w-auto text-left md:text-center py-3 md:py-2 bg-gray-200 text-gray-700 hover:bg-gray-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 ease-in-out relative z-10 rounded-md md:rounded-l-md md:rounded-r-none"
              >
                Monitoring
              </TabsTrigger>
              <TabsTrigger 
                value="configuration" 
                className="w-full md:w-auto text-left md:text-center py-3 md:py-2 bg-gray-200 text-gray-700 hover:bg-gray-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 ease-in-out relative z-10 rounded-md md:rounded-none"
              >
                Configuration
              </TabsTrigger>
              <TabsTrigger 
                value="knowledges" 
                className="w-full md:w-auto text-left md:text-center py-3 md:py-2 bg-gray-200 text-gray-700 hover:bg-gray-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 ease-in-out relative z-10 rounded-md md:rounded-none"
              >
                Knowledges
              </TabsTrigger>
              <TabsTrigger 
                value="playground" 
                className="w-full md:w-auto text-left md:text-center py-3 md:py-2 bg-gray-200 text-gray-700 hover:bg-gray-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 ease-in-out relative z-10 rounded-md md:rounded-none"
              >
                Playground
              </TabsTrigger>
              <TabsTrigger 
                value="channels" 
                className="w-full md:w-auto text-left md:text-center py-3 md:py-2 bg-gray-200 text-gray-700 hover:bg-gray-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 ease-in-out relative z-10 rounded-md md:rounded-r-md md:rounded-l-none"
              >
                Channels
              </TabsTrigger>
            </TabsList>
          </div>

          {activeTab === "knowledges" && (
            <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 bg-white">
              <input
                type="text"
                value={knowledgeKeyword}
                onChange={(e) => {
                  setKnowledgePage(1);
                  setKnowledgeKeyword(e.target.value);
                }}
                placeholder="Keyword (title)..."
                className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
              />
              <select
                value={knowledgeStatus}
                onChange={(e) => {
                  setKnowledgePage(1);
                  setKnowledgeStatus(e.target.value as any);
                }}
                className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <div className="flex md:col-span-2 lg:col-span-2">
                <button
                  onClick={() => {
                    setKnowledgeKeyword("");
                    setKnowledgeStatus("All");
                    setKnowledgePage(1);
                  }}
                  className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
            </div>
          )}
          {activeTab === "channels" && (
            <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 bg-white">
              <select
                value={channelCustomer}
                onChange={(e) => setChannelCustomer(e.target.value)}
                className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
              >
                <option value="All">All Customers</option>
                {channelCustomerOptions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <select
                value={channelType}
                onChange={(e) => setChannelType(e.target.value as any)}
                className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
              >
                <option value="All">All Types</option>
                {CHANNEL_PLATFORM_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <select
                value={channelStatus}
                onChange={(e) => setChannelStatus(e.target.value as any)}
                className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <div className="flex md:col-span-2 lg:col-span-1">
                <button
                  onClick={() => {
                    setChannelCustomer("All");
                    setChannelType("All");
                    setChannelStatus("All");
                  }}
                  className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        <TabsContent value="monitoring" className="mt-6">
          <AdminChatbotDetailMonitoringTab />
        </TabsContent>

        <TabsContent value="configuration" className="mt-6">
          <AdminChatbotDetailConfigurationTab />
        </TabsContent>

        <TabsContent value="knowledges" className="mt-6">
          <AdminChatbotDetailKnowledgesTab
            keyword={knowledgeKeyword}
            status={knowledgeStatus}
            page={knowledgePage}
            onPageChange={setKnowledgePage}
          />
        </TabsContent>

        <TabsContent value="playground" className="mt-6">
          <AdminChatbotDetailPlaygroundTab />
        </TabsContent>

        <TabsContent value="channels" className="mt-6">
          <AdminChatbotDetailChannelsTab
            rows={channelRows}
            customer={channelCustomer}
            type={channelType as any}
            status={channelStatus}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminChatbotDetail;