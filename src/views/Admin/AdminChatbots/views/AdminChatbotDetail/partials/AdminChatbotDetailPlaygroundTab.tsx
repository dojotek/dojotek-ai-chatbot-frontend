import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useChatAgentsControllerPlayground } from "@/sdk/chat-agents/chat-agents";

type AdminChatbotDetailPlaygroundTabProps = {
  chatAgentId: string;
};

function AdminChatbotDetailPlaygroundTab({ chatAgentId }: AdminChatbotDetailPlaygroundTabProps) {
  const [queryText, setQueryText] = useState("");
  const [responseText, setResponseText] = useState<string>("");

  const playgroundMutation = useChatAgentsControllerPlayground();

  const handleSend = async () => {
    if (!chatAgentId || !queryText.trim()) return;
    setResponseText("");
    try {
      const res = await playgroundMutation.mutateAsync({
        data: { chatAgentId, query: queryText.trim() } as any,
      });
      const payload = (res as any)?.data ?? null;
      setResponseText(payload ? JSON.stringify(payload, null, 2) : "No content");
    } catch (err: any) {
      const apiErr = err?.response?.data ?? err?.message ?? "Unknown error";
      setResponseText(typeof apiErr === "string" ? apiErr : JSON.stringify(apiErr, null, 2));
    }
  };

  const handleClear = () => {
    setQueryText("");
    setResponseText("");
  };

  const isSending = playgroundMutation.isPending;

  return (
    <div className="space-y-4">
      <Textarea
        rows={5}
        placeholder="Ask the chatbot something..."
        value={queryText}
        onChange={(e) => setQueryText(e.target.value)}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          className="self-end border"
          onClick={handleSend}
          disabled={!chatAgentId || !queryText.trim() || isSending}
        >
          {isSending ? "Sending..." : "Send"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="self-end border"
          onClick={handleClear}
          disabled={isSending}
        >
          Clear
        </Button>
      </div>
      <div className="rounded-md border bg-background p-4 min-h-24 whitespace-pre-wrap">
        {responseText || "Response will appear here."}
      </div>
    </div>
  );
}

export default AdminChatbotDetailPlaygroundTab;

