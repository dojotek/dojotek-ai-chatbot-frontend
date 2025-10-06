"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible } from "@/components/ui/collapsible";
import axios from "@/lib/axios";
import type { FileChunkDto } from "@/sdk/models/fileChunkDto";

type Props = {
  knowledgeId: string;
  selectedFiles: string[];
};

function AdminKnowledgeDetailPlaygroundTab({ knowledgeId, selectedFiles }: Props) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<FileChunkDto[]>([]);

  const submitQuery = async () => {
    if (!query.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const body = {
        query,
        knowledgeFileIds: Array.isArray(selectedFiles) ? selectedFiles : [],
      } as { query: string; knowledgeFileIds: string[] };

      const resp = await axios.post(
        `/knowledges/${knowledgeId}/playground`,
        body
      );

      const fileChunks: FileChunkDto[] = resp?.data?.fileChunks ?? [];
      setResults(fileChunks);
    } catch (e: any) {
      const message = e?.response?.data?.message || "Failed to run playground query";
      setError(typeof message === "string" ? message : "Failed to run playground query");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitQuery();
    }
  };

  return (
    <div className="space-y-6">
      {/* Query input */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your query to search similar chunks..."
            className="min-h-[80px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={submitQuery}
            disabled={!query.trim() || isLoading}
            className="self-end border"
            size="sm"
          >
            Search
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Press Enter to run, Shift+Enter for new line</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {/* Results */}
      <div className="rounded-md border">
        {isLoading ? (
          <div className="p-4 text-sm text-muted-foreground">Searching…</div>
        ) : results.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No results yet.</div>
        ) : (
          <ul className="divide-y">
            {results.map((chunk, idx) => (
              <li key={idx} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Score: {chunk.score?.toFixed(3)}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{chunk.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tips */}
      <Collapsible title="Tips for Testing" defaultOpen={false}>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Ask specific questions about the content you&apos;ve uploaded</p>
          <p>• Try different question formats (direct, conversational, etc.)</p>
          <p>• Test edge cases and complex queries</p>
          <p>• Use file filters above to narrow scope</p>
        </div>
      </Collapsible>
    </div>
  );
}

export default AdminKnowledgeDetailPlaygroundTab;