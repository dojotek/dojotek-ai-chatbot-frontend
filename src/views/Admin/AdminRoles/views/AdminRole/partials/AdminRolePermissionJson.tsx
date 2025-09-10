import { useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";

type AdminRolePermissionJsonProps = {
  permissions: string[];
  onChange: (permissions: string[]) => void;
};

function AdminRolePermissionJson({ permissions, onChange }: AdminRolePermissionJsonProps) {
  const value = useMemo(() => {
    return JSON.stringify(permissions, null, 2);
  }, [permissions]);

  const handleChange = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
        onChange(parsed);
      }
    } catch {
      // ignore invalid JSON; keep displaying user input via uncontrolled value
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Edit permissions as JSON array of strings, e.g. [&quot;Chatbot:Read&quot;, &quot;Channel:Update&quot;].
      </p>
      <Textarea
        className="min-h-[280px] font-mono"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
}

export default AdminRolePermissionJson;