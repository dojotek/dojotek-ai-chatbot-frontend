"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminKnowledgeDetailConfigurationTab from "./partials/AdminKnowledgeDetailConfigurationTab";
import AdminKnowledgeDetailFilesTab from "./partials/AdminKnowledgeDetailFilesTab";
import AdminKnowledgeDetailPlaygroundTab from "./partials/AdminKnowledgeDetailPlaygroundTab";
import { MultiSelectFilter, MultiSelectOption } from "@/components/ui/multi-select-filter";
import { faker } from "@faker-js/faker";
import { useKnowledgesControllerFindOne } from "@/sdk/knowledges/knowledges";
import { useKnowledgeFilesControllerFindByKnowledge } from "@/sdk/knowledge-files/knowledge-files";
import type { KnowledgeFile as ApiKnowledgeFile } from "@/sdk/models/knowledgeFile";

function AdminKnowledgeDetail() {
  const params = useParams();
  const knowledgeId = params.knowledgeId as string;
  
  const [activeTab, setActiveTab] = useState("files");

  // Fetch knowledge data
  const { data: knowledgeData, isLoading: knowledgeLoading, isError: knowledgeError } = useKnowledgesControllerFindOne(
    knowledgeId,
    { query: { enabled: !!knowledgeId } }
  );

  // Files tab filters
  const [filesKeyword, setFilesKeyword] = useState("");
  const [filesStatus, setFilesStatus] = useState<"All" | "failed" | "pending" | "processing" | "processed">("All");
  const [filesPage, setFilesPage] = useState(1);

  // Fetch knowledge files
  const { data: filesData, isLoading: filesLoading, isError: filesError } = useKnowledgeFilesControllerFindByKnowledge(
    knowledgeId,
    { skip: (filesPage - 1) * 10, take: 10 },
    { query: { enabled: !!knowledgeId } }
  );

  // Playground tab filters (select files)
  type KnowledgeFile = {
    id: string;
    name: string;
    tokens: string;
    uploadedAt: string;
    status: "Error" | "Pending" | "Processing" | "Processed";
  };

  // Generate file options from API data
  const fileOptions: MultiSelectOption[] = (filesData?.data ?? []).map((file: ApiKnowledgeFile) => ({
    value: file.id,
    label: file.fileName,
    disabled: false
  }));
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

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

      {/* Header with Back Button, Title, and Conditional Add File Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/knowledges"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold md:text-2xl">
              {knowledgeLoading ? "Loading..." : knowledgeError ? "Knowledge Not Found" : knowledgeData?.data?.name || "Knowledge Details"}
            </h1>
            {knowledgeData?.data && (
              <p className="text-sm text-muted-foreground mt-1">
                {knowledgeData.data.isActive ? "Active" : "Inactive"}
              </p>
            )}
          </div>
        </div>
        {activeTab === "files" && (
          <Link
            href={`/admin/knowledges/detail/${knowledgeId}/file/new`}
            className={
              cn(
                "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground",
                "border border-primary shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              )
            }
          >
            <Plus className="h-4 w-4" />
            Add File
          </Link>
        )}
      </div>

      {/* Tabs and Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="p-4 border rounded-md">
          <div className="w-full bg-gray-200 rounded-lg">
            <TabsList className="w-full h-auto bg-transparent p-0 justify-start relative flex flex-col md:flex-row gap-1 md:gap-0">
              <TabsTrigger 
                value="files" 
                className="w-full md:w-auto text-left md:text-center py-3 md:py-2 bg-gray-200 text-gray-700 hover:bg-gray-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 ease-in-out relative z-10 rounded-md md:rounded-l-md md:rounded-r-none"
              >
                Files
              </TabsTrigger>
              <TabsTrigger 
                value="playground" 
                className="w-full md:w-auto text-left md:text-center py-3 md:py-2 bg-gray-200 text-gray-700 hover:bg-gray-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 ease-in-out relative z-10 rounded-md md:rounded-none"
              >
                Playground
              </TabsTrigger>
              <TabsTrigger 
                value="configuration" 
                className="w-full md:w-auto text-left md:text-center py-3 md:py-2 bg-gray-200 text-gray-700 hover:bg-gray-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 ease-in-out relative z-10 rounded-md md:rounded-r-md md:rounded-l-none"
              >
                Configuration
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Filters under Tabs */}
          {activeTab === "files" && (
            <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 bg-white">
              <input
                type="text"
                value={filesKeyword}
                onChange={(e) => {
                  setFilesPage(1);
                  setFilesKeyword(e.target.value);
                }}
                placeholder="Search files..."
                className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
              />
              <select
                value={filesStatus}
                onChange={(e) => {
                  setFilesPage(1);
                  setFilesStatus(e.target.value as any);
                }}
                className="w-full rounded-md border bg-background px-4 py-2.5 text-sm"
              >
                <option value="All">All Status</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="processed">Processed</option>
              </select>
              <div className="flex md:col-span-2 lg:col-span-1">
                <button
                  onClick={() => {
                    setFilesKeyword("");
                    setFilesStatus("All");
                    setFilesPage(1);
                  }}
                  className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
            </div>
          )}

          {activeTab === "playground" && (
            <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 bg-white">
              <div className="relative">
                <MultiSelectFilter
                  options={fileOptions}
                  selectedValues={selectedFiles}
                  onSelectionChange={setSelectedFiles}
                  placeholder="Select files to filter..."
                  searchPlaceholder="Search files..."
                  emptyMessage="No files found"
                  selectAllText="All files"
                  clearAllText="Clear files"
                  className="w-full"
                />
              </div>
              <div className="flex md:col-span-2 lg:col-span-1">
                <button
                  onClick={() => setSelectedFiles([])}
                  className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        <TabsContent value="files" className="mt-6">
          <AdminKnowledgeDetailFilesTab 
            knowledgeId={knowledgeId}
            keyword={filesKeyword}
            status={filesStatus}
            page={filesPage}
            onPageChange={setFilesPage}
            onKeywordChange={setFilesKeyword}
            onStatusChange={setFilesStatus}
          />
        </TabsContent>

        <TabsContent value="configuration" className="mt-6">
          <AdminKnowledgeDetailConfigurationTab />
        </TabsContent>

        <TabsContent value="playground" className="mt-6">
          <AdminKnowledgeDetailPlaygroundTab selectedFiles={selectedFiles} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminKnowledgeDetail;