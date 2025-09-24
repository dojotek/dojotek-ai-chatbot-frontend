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
import { useChatAgentsControllerCreate } from "@/sdk/chat-agents/chat-agents";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCustomersControllerFindAll } from "@/sdk/customers/customers";

const PROVIDERS = ["OpenAI", "Anthropic"] as const;
const METHODS = ["Basic RAG", "Corrective RAG", "Self RAG", "Agentic RAG"] as const;
const OPENAI_MODELS = [
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4.1-mini",
  "gpt-4.1",
  "o4-mini",
  "o3-mini",
];
const ANTHROPIC_MODELS = [
  "claude-3-5-sonnet-latest",
  "claude-3-5-haiku-latest",
  "claude-3-opus-latest",
  "claude-3-sonnet-20240229",
];

const chatbotSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  method: z.enum(METHODS as any, "Method is required" as any),
  provider: z.enum(PROVIDERS as any, "Provider is required" as any),
  model: z.string().min(1, "Model is required"),
  systemPrompt: z.string().min(1, "System prompt is required"),
});

type ChatbotFormData = z.infer<typeof chatbotSchema>;

function AdminChatbotNewWizard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const createMutation = useChatAgentsControllerCreate({
    mutation: {
      onSuccess: async () => {
        toast.success("Chatbot created", { duration: 2500 });
        await queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]).includes("/chat-agents") });
        router.push("/admin/chatbots");
      },
      onError: (err: unknown) => {
        const message = (err as any)?.response?.data?.message || "Failed to create chatbot";
        toast.error(message, { duration: 3000 });
      },
    },
  } as any);

  const { data: customersResp } = useCustomersControllerFindAll(
    { skip: 0, take: 1000, search: "" } as any,
    { query: {} }
  );
  const customers = (customersResp?.data ?? []) as any[];

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
  } = useForm<ChatbotFormData>({
    resolver: zodResolver(chatbotSchema),
    defaultValues: {
      customerId: "",
      title: "",
      description: "",
      method: undefined as unknown as ChatbotFormData["method"],
      provider: undefined as unknown as ChatbotFormData["provider"],
      model: "",
      systemPrompt: "",
    },
  });

  const onSubmit = async (data: ChatbotFormData) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        data: {
          customerId: data.customerId,
          name: data.title,
          description: data.description || undefined,
          systemPrompt: data.systemPrompt,
          isActive: true,
          config: {
            method: data.method,
            provider: data.provider,
            model: data.model,
          },
        },
      } as any);
    } catch (error) {
      // handled in mutation onError
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
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.customerId && (
                <p className="text-sm text-red-500">{errors.customerId.message}</p>
              )}
            </div>
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

            {/* Method */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Method <span className="text-red-500">*</span></label>
              <select
                {...register("method") as any}
                className={cn(
                  "w-full rounded-md border bg-background px-3 py-2",
                  errors.method && "border-red-500 focus-visible:ring-red-500"
                )}
              >
                <option value="">Select method</option>
                {METHODS.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
              {errors.method?.message && (
                <p className="text-sm text-red-500">{String(errors.method.message)}</p>
              )}
            </div>

            {/* Provider */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Provider <span className="text-red-500">*</span></label>
              <select
                {...register("provider") as any}
                className={cn(
                  "w-full rounded-md border bg-background px-3 py-2",
                  errors.provider && "border-red-500 focus-visible:ring-red-500"
                )}
                onChange={(e) => {
                  const v = e.target.value as ChatbotFormData["provider"];
                  setValue("provider", v as any, { shouldValidate: true });
                  setValue("model", "");
                }}
              >
                <option value="">Select provider</option>
                {PROVIDERS.map((p) => (<option key={p} value={p}>{p}</option>))}
              </select>
              {errors.provider?.message && (
                <p className="text-sm text-red-500">{String(errors.provider.message)}</p>
              )}
            </div>

            {/* Model */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Model <span className="text-red-500">*</span></label>
              <select
                {...register("model") as any}
                className={cn(
                  "w-full rounded-md border bg-background px-3 py-2",
                  errors.model && "border-red-500 focus-visible:ring-red-500"
                )}
              >
                <option value="">Select model</option>
                {(watch("provider") === "Anthropic" ? ANTHROPIC_MODELS : OPENAI_MODELS).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {errors.model && (
                <p className="text-sm text-red-500">{errors.model.message}</p>
              )}
            </div>

            {/* System Prompt */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">System Prompt <span className="text-red-500">*</span></label>
              <Textarea rows={3} placeholder="You are a helpful assistant..." {...register("systemPrompt")} className={cn(
                errors.systemPrompt && "border-red-500 focus-visible:ring-red-500"
              )} />
              {errors.systemPrompt && (
                <p className="text-sm text-red-500">{errors.systemPrompt.message}</p>
              )}
            </div>
          </div>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 md:flex-row md:justify-end md:gap-4">
          <Button
            type="submit"
            variant="outline"
            disabled={isSubmitting || !isValid}
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