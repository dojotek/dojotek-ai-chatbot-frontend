"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Collapsible } from "@/components/ui/collapsible";

// Form validation schema
const customerStaffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  externalId: z.string().min(1, "External ID is required"),
  status: z.enum(["Active", "Inactive"]),
  note: z.string().optional(),
});

type CustomerStaffFormData = z.infer<typeof customerStaffSchema>;

function AdminCustomerStaff() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomerStaffFormData>({
    resolver: zodResolver(customerStaffSchema),
    defaultValues: {
      name: "",
      externalId: "",
      status: "Active",
      note: "",
    },
  });

  const onSubmit = async (data: CustomerStaffFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Form submitted:", data);
      // Navigate back to customer staffs list after successful save
      router.push("/admin/customer-staffs");
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle error (e.g., show error toast)
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

            {/* External ID Field */}
            <div className="space-y-2">
              <label htmlFor="externalId" className="text-sm font-medium">
                External ID <span className="text-red-500">*</span>
              </label>
              <Input
                id="externalId"
                {...register("externalId")}
                placeholder="Enter external ID"
                className={cn(
                  errors.externalId && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.externalId && (
                <p className="text-sm text-red-500">{errors.externalId.message}</p>
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

            {/* Note Field - Full Width */}
            <div className="space-y-2">
              <label htmlFor="note" className="text-sm font-medium">
                Note
              </label>
              <Textarea
                id="note"
                {...register("note")}
                placeholder="Enter additional notes..."
                rows={3}
                className={cn(
                  errors.note && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.note && (
                <p className="text-sm text-red-500">{errors.note.message}</p>
              )}
            </div>
          </div>
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

export default AdminCustomerStaff;