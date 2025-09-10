import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function AdminChatbotDetailPlaygroundTab() {
  return (
    <div className="space-y-4">
      <Textarea rows={5} placeholder="Ask the chatbot something..." />
      <div className="flex gap-2">
        <Button type="button">Send</Button>
        <Button type="button" variant="secondary">Clear</Button>
      </div>
      <div className="rounded-md border bg-background p-4 min-h-24">
        Response will appear here.
      </div>
    </div>
  );
}

export default AdminChatbotDetailPlaygroundTab;

