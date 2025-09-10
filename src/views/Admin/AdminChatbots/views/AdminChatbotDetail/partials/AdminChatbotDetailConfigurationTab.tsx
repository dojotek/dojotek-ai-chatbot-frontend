import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Collapsible } from "@/components/ui/collapsible";
import { Save } from "lucide-react";
import { Select } from "@/components/ui/select";

function AdminChatbotDetailConfigurationTab() {
  return (
    <form className="space-y-6">
      <Collapsible title="Configuration" defaultOpen={true}>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Chatbot Name</label>
            <Input placeholder="e.g. Dojotek Support Bot" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Model</label>
            <Input placeholder="e.g. gpt-4o-mini" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Method</label>
            <Select defaultValue="Simple RAG">
              <option value="Simple RAG">Simple RAG</option>
              <option value="Self RAG">Self RAG</option>
              <option value="Woo RAG">Woo RAG</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">System Prompt</label>
            <Textarea rows={6} placeholder="You are a helpful assistant..." />
          </div>
        </div>
      </Collapsible>

      <div className="flex flex-col gap-3 md:flex-row md:justify-end md:gap-4">
        <Button type="button" variant="outline" className="w-full md:w-auto px-8">
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button type="reset" variant="outline" className="w-full md:w-auto px-8">
          Reset
        </Button>
      </div>
    </form>
  );
}

export default AdminChatbotDetailConfigurationTab;

