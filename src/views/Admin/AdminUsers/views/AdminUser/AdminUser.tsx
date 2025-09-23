"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Collapsible } from "@/components/ui/collapsible";
import { useUsersControllerCreate, useUsersControllerFindOne, useUsersControllerUpdate } from "@/sdk/users/users";
import { useRolesControllerFindAll } from "@/sdk/roles/roles";
import type { Role as ApiRole } from "@/sdk/models/role";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Form validation schema
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  roleId: z.string().min(1, "Role is required"),
  status: z.enum(["Active", "Inactive"]),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  passwordConfirmation: z.string().optional().or(z.literal("")),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Passwords don't match",
  path: ["passwordConfirmation"],
});

type UserFormData = z.infer<typeof userSchema>;

function AdminUser() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const userId = params?.id as string | undefined;
  const isEditMode = Boolean(userId);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      roleId: "",
      status: "Active",
      password: "",
      passwordConfirmation: "",
    },
    mode: "onChange",
  });

  const passwordValue = watch("password", "");

  // Load roles for select
  const { data: rolesResp } = useRolesControllerFindAll(
    { skip: 0, take: 1000, search: "" },
    { query: {} }
  );
  const roles = useMemo(() => (rolesResp?.data ?? []) as ApiRole[], [rolesResp]);

  // Load user if edit mode
  const { data: getOneResp } = useUsersControllerFindOne(userId ?? "", { query: { enabled: isEditMode } });

  useEffect(() => {
    const user = getOneResp?.data;
    if (!user) return;
    reset({
      name: (typeof user.name === "string" ? (user.name as unknown as string) : (user.name as any)?.full ?? (user.name as any)?.first ?? "") as string,
      email: user.email,
      roleId: user.roleId,
      status: user.isActive ? "Active" : "Inactive",
      password: "",
      passwordConfirmation: "",
    });
  }, [getOneResp, reset]);

  const createMutation = useUsersControllerCreate({
    mutation: {
      onSuccess: async (resp) => {
        toast.success("User created", { duration: 2500 });
        await queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]).includes("/users") });
        const newId = resp.data.id;
        if (newId) router.replace(`/admin/users/edit/${newId}`);
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to create user";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  const updateMutation = useUsersControllerUpdate({
    mutation: {
      onSuccess: async () => {
        toast.success("User updated", { duration: 2500 });
        await queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]).includes("/users") });
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to update user";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && userId) {
        const payload = {
          name: data.name,
          email: data.email,
          roleId: data.roleId,
          ...(data.password ? { password: data.password } : {}),
          // status change would require an endpoint supporting isActive; skipped here
        } as const;
        updateMutation.mutate({ id: userId, data: payload as any });
      } else {
        const payload = {
          name: data.name,
          email: data.email,
          roleId: data.roleId,
          password: data.password || "",
        } as const;
        createMutation.mutate({ data: payload as any });
      }
    } catch (error) {
      // handled in mutations
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    // Navigate back to users list
    router.push("/admin/users");
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
            <Link href="/admin/users" className="hover:underline">Users</Link>
          </li>
          <li>/</li>
          <li className="text-foreground">User Details</li>
        </ol>
      </nav>

      {/* Header with Back Button and Title */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold md:text-2xl">User Details</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Collapsible Section */}
        <Collapsible title="User Information" defaultOpen={true}>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter user name"
                className={cn(
                  errors.name && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter email address"
                className={cn(
                  errors.email && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Role Field */}
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="roleId"
                {...register("roleId") as any}
                className={cn(
                  "w-full rounded-md border bg-background px-3 py-2",
                  errors.roleId && "border-red-500 focus-visible:ring-red-500"
                )}
              >
                <option value="">Select a role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              {errors.roleId && (
                <p className="text-sm text-red-500">{errors.roleId.message}</p>
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
                className={cn(
                  errors.status && "border-red-500 focus-visible:ring-red-500"
                )}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password{!isEditMode ? " *" : ""}
              </label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Enter password"
                className={cn(
                  errors.password && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Password Confirmation Field */}
            <div className="space-y-2">
              <label htmlFor="passwordConfirmation" className="text-sm font-medium">
                Password Confirmation{!isEditMode ? " *" : ""}
              </label>
              <Input
                id="passwordConfirmation"
                type="password"
                {...register("passwordConfirmation")}
                placeholder="Confirm password"
                className={cn(
                  errors.passwordConfirmation && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.passwordConfirmation && (
                <p className="text-sm text-red-500">{errors.passwordConfirmation.message}</p>
              )}
            </div>
          </div>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 md:flex-row md:justify-end md:gap-4">
          <Button
            type="submit"
            variant="outline"
            disabled={
              isSubmitting ||
              createMutation.isPending ||
              updateMutation.isPending ||
              !isValid ||
              (isEditMode && !isDirty) ||
              (!isEditMode && (!passwordValue || String(passwordValue).length < 6))
            }
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

export default AdminUser;