import { Checkbox } from "@/components/ui/checkbox";

type AdminRolePermissionVisualProps = {
  permissions: string[];
  onChange: (permissions: string[]) => void;
};

const RESOURCES: Array<{ resource: string; actions: string[] }> = [
  { resource: "Chatbot", actions: ["Menu", "Create", "Read", "Update", "Delete"] },
  { resource: "Channel", actions: ["Menu", "Create", "Read", "Update", "Delete"] },
  { resource: "ChatSession", actions: ["Menu", "Create", "Read", "Update", "Delete"] },
  { resource: "Customer", actions: ["Menu", "Create", "Read", "Update", "Delete"] },
  { resource: "CustomerStaff", actions: ["Menu", "Create", "Read", "Update", "Delete"] },
  { resource: "Dashboard", actions: ["Menu", "Read"] },
  { resource: "Knowledge", actions: ["Menu", "Create", "Read", "Update", "Delete"] },
  { resource: "SystemSetting", actions: ["Menu", "Read", "Update"] },
];

function AdminRolePermissionVisual({ permissions, onChange }: AdminRolePermissionVisualProps) {
  const isChecked = (permissionKey: string) => permissions.includes(permissionKey);

  const togglePermission = (permissionKey: string) => {
    if (isChecked(permissionKey)) {
      onChange(permissions.filter((p) => p !== permissionKey));
    } else {
      onChange([...permissions, permissionKey]);
    }
  };

  const toggleResourceAll = (resource: string, actionKeys: string[]) => {
    const keys = actionKeys.map((a) => `${resource}:${a}`);
    const allSelected = keys.every((k) => permissions.includes(k));
    if (allSelected) {
      onChange(permissions.filter((p) => !keys.includes(p)));
    } else {
      const set = new Set(permissions);
      keys.forEach((k) => set.add(k));
      onChange(Array.from(set));
    }
  };

  return (
    <div className="space-y-6">
      {RESOURCES.map(({ resource, actions }) => {
        const keys = actions.map((a) => `${resource}:${a}`);
        const allChecked = keys.every((k) => permissions.includes(k));
        const someChecked = !allChecked && keys.some((k) => permissions.includes(k));

        return (
          <div key={resource} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">{resource}</h3>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={allChecked}
                  onCheckedChange={() => toggleResourceAll(resource, actions)}
                  aria-label={`Select all ${resource}`}
                />
                <span className="text-sm text-muted-foreground">Select All</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {actions.map((action) => {
                const key = `${resource}:${action}`;
                return (
                  <label key={key} className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent">
                    <Checkbox
                      checked={isChecked(key)}
                      onCheckedChange={() => togglePermission(key)}
                      aria-label={key}
                    />
                    <span className="text-sm">{action}</span>
                  </label>
                );
              })}
            </div>

            {someChecked && (
              <p className="mt-2 text-xs text-muted-foreground">Partial selection</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default AdminRolePermissionVisual;