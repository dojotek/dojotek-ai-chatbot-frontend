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
import { Textarea } from "@/components/ui/textarea";
import { Collapsible } from "@/components/ui/collapsible";
import { useKnowledgesControllerCreate } from "@/sdk/knowledges/knowledges";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const knowledgeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean(),
});

type KnowledgeFormData = z.infer<typeof knowledgeSchema>;

function AdminKnowledgeNewWizard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const createMutation = useKnowledgesControllerCreate({
    mutation: {
      onSuccess: async () => {
        toast.success("Knowledge created", { duration: 2000 });
        // Invalidate any knowledges list queries
        await queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]).includes("/knowledges") });
        router.push("/admin/knowledges");
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to create knowledge";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<KnowledgeFormData>({
    resolver: zodResolver(knowledgeSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      isActive: true,
    },
  });

  const onSubmit = async (data: KnowledgeFormData) => {
    setIsSubmitting(true);
    try {
      createMutation.mutate({ data });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    router.push("/admin/knowledges");
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
            <Link href="/admin/knowledges" className="hover:underline">Knowledges</Link>
          </li>
          <li>/</li>
          <li className="text-foreground">New Knowledge</li>
        </ol>
      </nav>

      {/* Header with Back Button and Title */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/knowledges"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold md:text-2xl">New Knowledge</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Collapsible Section */
      }
        <Collapsible title="Knowledge Information" defaultOpen={true}>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {/* Title Field */}
            <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name <span className="text-red-500">*</span>
              </label>
              <Input
              id="name"
              {...register("name")}
              placeholder="Enter name"
                className={cn(
                errors.name && "border-red-500 focus-visible:ring-red-500"
                )}
              />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Description Field - Full Width */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter description..."
                rows={3}
                className={cn(
                  errors.description && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <Input
              id="category"
              {...register("category")}
              placeholder="e.g., policy, product, faq"
            />
          </div>

          {/* Active */}
          <div className="space-y-2">
            <label htmlFor="isActive" className="text-sm font-medium">
              Active
            </label>
            <div className="flex items-center gap-2">
              <input id="isActive" type="checkbox" {...register("isActive")} />
              <span className="text-sm text-muted-foreground">Enabled</span>
            </div>
          </div>
          </div>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 md:flex-row md:justify-end md:gap-4">
          <Button
            type="submit"
            variant="outline"
            disabled={isSubmitting || createMutation.isPending || !isDirty}
            className="w-full md:w-auto px-8"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting || createMutation.isPending ? "Saving..." : "Save"}
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

export default AdminKnowledgeNewWizard;