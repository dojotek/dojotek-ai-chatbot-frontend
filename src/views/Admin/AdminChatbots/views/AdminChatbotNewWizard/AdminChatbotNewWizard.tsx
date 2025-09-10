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

const chatbotSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type ChatbotFormData = z.infer<typeof chatbotSchema>;

function AdminChatbotNewWizard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChatbotFormData>({
    resolver: zodResolver(chatbotSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (data: ChatbotFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Chatbot form submitted:", data);
      router.push("/admin/chatbots");
    } catch (error) {
      console.error("Error submitting chatbot form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    router.push("/admin/chatbots");
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
            <Link href="/admin/chatbots" className="hover:underline">Chatbots</Link>
          </li>
          <li>/</li>
          <li className="text-foreground">New Chatbot</li>
        </ol>
      </nav>

      {/* Header with Back Button and Title */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/chatbots"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold md:text-2xl">New Chatbot</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Collapsible Section */}
        <Collapsible title="Chatbot Information" defaultOpen={true}>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {/* Title Field */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter title"
                className={cn(
                  errors.title && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
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

export default AdminChatbotNewWizard;