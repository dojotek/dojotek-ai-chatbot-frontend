"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Collapsible } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminRolePermissionJson from "./partials/AdminRolePermissionJson";
import AdminRolePermissionVisual from "./partials/AdminRolePermissionVisual";

const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.enum(["Active", "Inactive"]),
  permissions: z.array(z.string()),
});

type RoleFormData = z.infer<typeof roleSchema>;

function AdminRole() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("visual");

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
      status: "Active",
      permissions: [],
    },
  });

  const onSubmit = async (data: RoleFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Role form submitted:", data);
      router.push("/admin/roles");
    } catch (error) {
      console.error("Error submitting role form:", error);
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

            {/* Status Field */}
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status <span className="text-red-500">*</span>
              </label>
              <Select
                id="status"
                {...register("status")}
                className={cn(errors.status && "border-red-500 focus-visible:ring-red-500")}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
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
            {isSubmitting ? "Saving..." : "Save"}
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