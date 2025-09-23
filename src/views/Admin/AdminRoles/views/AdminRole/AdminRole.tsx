"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminRolePermissionJson from "./partials/AdminRolePermissionJson";
import AdminRolePermissionVisual from "./partials/AdminRolePermissionVisual";
import { useEffect } from "react";
import { useRolesControllerCreate, useRolesControllerFindOne, useRolesControllerUpdate } from "@/sdk/roles/roles";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  permissions: z.array(z.string()),
});

type RoleFormData = z.infer<typeof roleSchema>;

function AdminRole() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const roleId = params?.id as string | undefined;
  const isEditMode = Boolean(roleId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("visual");
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  const { data: getOneResp } = useRolesControllerFindOne(roleId ?? "", {
    query: {
      enabled: isEditMode,
    },
  });

  useEffect(() => {
    const role = getOneResp?.data;
    if (!role) return;
    // Backend permissions are object; UI uses string[] like Resource:Action
    const keys: string[] = Array.isArray(role.permissions)
      ? []
      : role.permissions
      ? Object.entries(role.permissions)
          .flatMap(([resource, actions]) => {
            if (!actions) return [] as string[];
            if (Array.isArray(actions)) return actions.map((a) => `${resource}:${a}`);
            if (typeof actions === "object") return Object.keys(actions as any).map((a) => `${resource}:${a}`);
            return [] as string[];
          })
      : [];
    reset({ name: role.name ?? "", description: (role as any).description ?? "", permissions: keys });
  }, [getOneResp, reset]);

  const createMutation = useRolesControllerCreate({
    mutation: {
      onSuccess: async (resp) => {
        toast.success("Role created", { duration: 2500 });
        await queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]).includes("/roles") });
        const newId = resp.data.id;
        if (newId) router.replace(`/admin/roles/edit/${newId}`);
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to create role";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  const updateMutation = useRolesControllerUpdate({
    mutation: {
      onSuccess: async () => {
        toast.success("Role updated", { duration: 2500 });
        await queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]).includes("/roles") });
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to update role";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  const toPermissionsObject = (permissionKeys: string[]) => {
    // Convert ["Resource:Action", ...] into { Resource: [Action, ...] }
    const map: Record<string, string[]> = {};
    for (const key of permissionKeys) {
      const [resource, action] = key.split(":");
      if (!resource || !action) continue;
      if (!map[resource]) map[resource] = [];
      if (!map[resource].includes(action)) map[resource].push(action);
    }
    return map as any;
  };

  const onSubmit = async (data: RoleFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        description: data.description || undefined,
        permissions: toPermissionsObject(data.permissions),
      } as const;

      if (isEditMode && roleId) {
        updateMutation.mutate({ id: roleId, data: payload });
      } else {
        createMutation.mutate({ data: payload });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    router.push("/admin/roles");
  };

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
            <Link href="/admin/roles" className="hover:underline">Roles</Link>
          </li>
          <li>/</li>
          <li className="text-foreground">Role Details</li>
        </ol>
      </nav>

      {/* Header with Back Button and Title */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/roles"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold md:text-2xl">Role Details</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Collapsible: Role Information */}
        <Collapsible title="Role Information" defaultOpen={true}>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter role name"
                className={cn(errors.name && "border-red-500 focus-visible:ring-red-500")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="description"
                {...register("description")}
                placeholder="Enter description"
                className={cn(errors.description && "border-red-500 focus-visible:ring-red-500")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
          </div>
        </Collapsible>

        {/* Collapsible: Permissions */}
        <Collapsible title="Permissions" defaultOpen={true}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="w-full bg-gray-200 rounded-lg p-1">
              <TabsList className="w-full h-auto bg-transparent p-0 justify-start relative flex flex-col md:flex-row gap-1 md:gap-0">
                <TabsTrigger 
                  value="visual" 
                  className="w-full md:w-auto text-left md:text-center py-3 md:py-2 bg-white text-gray-700 hover:bg-gray-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 ease-in-out relative z-10 rounded-md md:rounded-l-md md:rounded-r-none"
                >
                  Visual
                </TabsTrigger>
                <TabsTrigger 
                  value="json" 
                  className="w-full md:w-auto text-left md:text-center py-3 md:py-2 bg-white text-gray-700 hover:bg-gray-50 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 ease-in-out relative z-10 rounded-md md:rounded-r-md md:rounded-l-none"
                >
                  JSON
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="visual" className="mt-6">
              <AdminRolePermissionVisual
                permissions={watch("permissions")}
                onChange={(perms) => setValue("permissions", perms, { shouldDirty: true })}
              />
            </TabsContent>

            <TabsContent value="json" className="mt-6">
              <AdminRolePermissionJson
                permissions={watch("permissions")}
                onChange={(perms) => setValue("permissions", perms, { shouldDirty: true })}
              />
            </TabsContent>
          </Tabs>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 md:flex-row md:justify-end md:gap-4">
          <Button
            type="submit"
            variant="outline"
            disabled={isSubmitting}
            className="w-full md:w-auto px-8"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting || createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="w-full md:w-auto px-8"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AdminRole;