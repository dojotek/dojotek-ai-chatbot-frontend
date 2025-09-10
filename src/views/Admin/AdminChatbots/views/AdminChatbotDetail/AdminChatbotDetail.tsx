"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminChatbotDetailMonitoringTab from "./partials/AdminChatbotDetailMonitoringTab";
import AdminChatbotDetailConfigurationTab from "./partials/AdminChatbotDetailConfigurationTab";
import AdminChatbotDetailKnowledgesTab from "./partials/AdminChatbotDetailKnowledgesTab";
import AdminChatbotDetailPlaygroundTab from "./partials/AdminChatbotDetailPlaygroundTab";
import AdminChatbotDetailChannelsTab from "./partials/AdminChatbotDetailChannelsTab";

function AdminChatbotDetail() {
  const [activeTab, setActiveTab] = useState("monitoring");

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

      {/* Header with Back Button and Title */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/chatbots"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold md:text-2xl">Chatbot Details</h1>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full bg-gray-200 rounded-lg p-1">
          <TabsList className="w-full h-auto bg-transparent p-0 justify-start relative flex flex-col md:flex-row gap-1 md:gap-0">
            <TabsTrigger 
              value="monitoring" 
              className="w-full md:w-auto text-left md:text-center py-3 md:py-2 bg-white text-gray-700 hover:bg-gray-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 ease-in-out relative z-10 rounded-md md:rounded-l-md md:rounded-r-none"
            >
              Monitoring
            </TabsTrigger>
            <TabsTrigger 
              value="configuration" 
              className="w-full md:w-auto text-left md:text-center py-3 md:py-2 bg-white text-gray-700 hover:bg-gray-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 ease-in-out relative z-10 rounded-md md:rounded-none"
            >
              Configuration
            </TabsTrigger>
            <TabsTrigger 
              value="knowledges" 
              className="w-full md:w-auto text-left md:text-center py-3 md:py-2 bg-white text-gray-700 hover:bg-gray-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 ease-in-out relative z-10 rounded-md md:rounded-none"
            >
              Knowledges
            </TabsTrigger>
            <TabsTrigger 
              value="playground" 
              className="w-full md:w-auto text-left md:text-center py-3 md:py-2 bg-white text-gray-700 hover:bg-gray-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 ease-in-out relative z-10 rounded-md md:rounded-none"
            >
              Playground
            </TabsTrigger>
            <TabsTrigger 
              value="channels" 
              className="w-full md:w-auto text-left md:text-center py-3 md:py-2 bg-white text-gray-700 hover:bg-gray-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 ease-in-out relative z-10 rounded-md md:rounded-r-md md:rounded-l-none"
            >
              Channels
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="monitoring" className="mt-6">
          <AdminChatbotDetailMonitoringTab />
        </TabsContent>

        <TabsContent value="configuration" className="mt-6">
          <AdminChatbotDetailConfigurationTab />
        </TabsContent>

        <TabsContent value="knowledges" className="mt-6">
          <AdminChatbotDetailKnowledgesTab />
        </TabsContent>

        <TabsContent value="playground" className="mt-6">
          <AdminChatbotDetailPlaygroundTab />
        </TabsContent>

        <TabsContent value="channels" className="mt-6">
          <AdminChatbotDetailChannelsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminChatbotDetail;