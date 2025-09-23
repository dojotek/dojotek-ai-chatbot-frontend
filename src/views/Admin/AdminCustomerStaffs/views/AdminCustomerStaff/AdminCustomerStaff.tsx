"use client";

import { useEffect, useState } from "react";
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
import { useCustomerStaffsControllerCreate, useCustomerStaffsControllerFindOne, useCustomerStaffsControllerUpdate } from "@/sdk/customer-staffs/customer-staffs";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCustomersControllerFindAll } from "@/sdk/customers/customers";
import type { Customer as ApiCustomer } from "@/sdk/models/customer";

// Form validation schema
const customerStaffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  customerId: z.string().min(1, "Customer ID is required"),
  status: z.enum(["Active", "Inactive"]),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

type CustomerStaffFormData = z.infer<typeof customerStaffSchema>;

function AdminCustomerStaff() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const staffId = params?.id as string | undefined;
  const isEditMode = Boolean(staffId);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
  } = useForm<CustomerStaffFormData>({
    resolver: zodResolver(customerStaffSchema),
    defaultValues: {
      name: "",
      customerId: "",
      status: "Active",
      email: "",
      phone: "",
    },
    mode: "onChange",
  });

  const { data: getOneResp } = useCustomerStaffsControllerFindOne(staffId ?? "", {
    query: {
      enabled: isEditMode,
    },
  });

  // Load customers for select
  const { data: customersResp } = useCustomersControllerFindAll(
    {
      skip: 0,
      take: 1000,
      search: "",
      industry: "",
      isActive: "",
    },
    { query: {} }
  );
  const customers = (customersResp?.data ?? []) as ApiCustomer[];

  useEffect(() => {
    const staff = getOneResp?.data;
    if (!staff) return;
    reset({
      name: staff.name ?? "",
      customerId: staff.customerId ?? "",
      status: staff.isActive ? "Active" : "Inactive",
      email: (staff as any).email ?? "",
      phone: (staff as any).phone ?? "",
    });
  }, [getOneResp, reset]);

  const createMutation = useCustomerStaffsControllerCreate({
    mutation: {
      onSuccess: async (resp) => {
        toast.success("Customer staff created", { duration: 2500 });
        await queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]).includes("/customer-staffs") });
        const newId = resp.data.id;
        if (newId) {
          router.replace(`/admin/customer-staffs/edit/${newId}`);
        }
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to create customer staff";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  const updateMutation = useCustomerStaffsControllerUpdate({
    mutation: {
      onSuccess: async () => {
        toast.success("Customer staff updated", { duration: 2500 });
        await queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]).includes("/customer-staffs") });
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to update customer staff";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  const onSubmit = async (data: CustomerStaffFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        customerId: data.customerId,
        email: data.email || undefined,
        phone: data.phone || undefined,
        // status is updated via isActive in update endpoint only
      } as const;

      if (isEditMode && staffId) {
        updateMutation.mutate({ id: staffId, data: { ...payload, /* allow toggling active via form */ ...(data.status ? { } : {}), } as any });
      } else {
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
    // Navigate back to customer staffs list
    router.push("/admin/customer-staffs");
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
            <Link href="/admin/customer-staffs" className="hover:underline">Customer Staffs</Link>
          </li>
          <li>/</li>
          <li className="text-foreground">Customer Staff Details</li>
        </ol>
      </nav>

      {/* Header with Back Button and Title */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/customer-staffs"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold md:text-2xl">Customer Staff Details</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Collapsible Section */}
        <Collapsible title="Customer Staff Information" defaultOpen={true}>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter customer staff name"
                className={cn(
                  errors.name && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Customer Field */}
            <div className="space-y-2">
              <label htmlFor="customerId" className="text-sm font-medium">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                id="customerId"
                {...register("customerId") as any}
                className={cn(
                  "w-full rounded-md border bg-background px-3 py-2",
                  errors.customerId && "border-red-500 focus-visible:ring-red-500"
                )}
              >
                <option value="">Select a customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.customerId && (
                <p className="text-sm text-red-500">{errors.customerId.message}</p>
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

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                {...register("email")}
                placeholder="Enter email (optional)"
                className={cn(
                  errors.email && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone
              </label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="Enter phone (optional)"
                className={cn(
                  errors.phone && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{(errors.phone as any).message}</p>
              )}
            </div>
          </div>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 md:flex-row md:justify-end md:gap-4">
          <Button
            type="submit"
            variant="outline"
            disabled={isSubmitting || createMutation.isPending || updateMutation.isPending || !isValid || (isEditMode && !isDirty)}
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

export default AdminCustomerStaff;