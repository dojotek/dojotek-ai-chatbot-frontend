"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminKnowledgeDetailConfigurationTab from "./partials/AdminKnowledgeDetailConfigurationTab";
import AdminKnowledgeDetailFilesTab from "./partials/AdminKnowledgeDetailFilesTab";
import AdminKnowledgeDetailPlaygroundTab from "./partials/AdminKnowledgeDetailPlaygroundTab";

function AdminKnowledgeDetail() {
  const [activeTab, setActiveTab] = useState("files");

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
            <Link href="/admin/knowledges" className="hover:underline">Knowledges</Link>
          </li>
          <li>/</li>
          <li className="text-foreground">Knowledge Details</li>
        </ol>
      </nav>

      {/* Header with Back Button and Title */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/knowledges"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold md:text-2xl">Knowledge Details</h1>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full bg-gray-200 rounded-lg p-1">
          <TabsList className="w-full h-auto bg-transparent p-0 justify-start relative">
            <TabsTrigger 
              value="files" 
              className="bg-white text-gray-700 hover:bg-gray-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 ease-in-out relative z-10 rounded-l-md rounded-r-none"
            >
              Files
            </TabsTrigger>
            <TabsTrigger 
              value="playground" 
              className="bg-white text-gray-700 hover:bg-gray-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 ease-in-out relative z-10 rounded-none"
            >
              Playground
            </TabsTrigger>
            <TabsTrigger 
              value="configuration" 
              className="bg-white text-gray-700 hover:bg-gray-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 ease-in-out relative z-10 rounded-r-md rounded-l-none"
            >
              Configuration
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="files" className="mt-6">
          <AdminKnowledgeDetailFilesTab />
        </TabsContent>

        <TabsContent value="configuration" className="mt-6">
          <AdminKnowledgeDetailConfigurationTab />
        </TabsContent>

        <TabsContent value="playground" className="mt-6">
          <AdminKnowledgeDetailPlaygroundTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminKnowledgeDetail;