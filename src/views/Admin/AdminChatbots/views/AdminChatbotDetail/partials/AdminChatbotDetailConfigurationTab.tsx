import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Collapsible } from "@/components/ui/collapsible";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useChatAgentsControllerUpdate } from "@/sdk/chat-agents/chat-agents";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  method: z.enum(METHODS as any, "Method is required" as any),
  provider: z.enum(PROVIDERS as any, "Provider is required" as any),
  model: z.string().min(1, "Model is required"),
  systemPrompt: z.string().min(1, "System prompt is required"),
});

type FormData = z.infer<typeof schema>;

function AdminChatbotDetailConfigurationTab({ agent }: { agent: any }) {
  const queryClient = useQueryClient();
  const updateMutation = useChatAgentsControllerUpdate({
    mutation: {
      onSuccess: async () => {
        toast.success("Chatbot updated", { duration: 2500 });
        await queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]).includes("/chat-agents") });
      },
      onError: (err: unknown) => {
        const message = (err as any)?.response?.data?.message || "Failed to update chatbot";
        toast.error(message, { duration: 3000 });
      },
    },
  } as any);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: agent?.name ?? "",
      method: (agent?.config?.method as any) ?? (undefined as unknown as FormData["method"]),
      provider: (agent?.config?.provider as any) ?? (undefined as unknown as FormData["provider"]),
      model: (agent?.config?.model as any) ?? "",
      systemPrompt: agent?.systemPrompt ?? "",
    },
  });

  useEffect(() => {
    if (agent) {
      reset({
        title: agent?.name ?? "",
        method: (agent?.config?.method as any) ?? (undefined as unknown as FormData["method"]),
        provider: (agent?.config?.provider as any) ?? (undefined as unknown as FormData["provider"]),
        model: (agent?.config?.model as any) ?? "",
        systemPrompt: agent?.systemPrompt ?? "",
      });
    }
  }, [agent, reset]);

  const onSubmit = async (data: FormData) => {
    if (!agent?.id) return;
    await updateMutation.mutateAsync({
      id: agent.id,
      data: {
        name: data.title,
        systemPrompt: data.systemPrompt,
        config: {
          ...(agent.config ?? {}),
          method: data.method,
          provider: data.provider,
          model: data.model,
        },
      },
    } as any);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <Collapsible title="Configuration" defaultOpen={true}>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input placeholder="e.g. Dojotek Support Bot" {...register("title")} className={cn(errors.title && "border-red-500 focus-visible:ring-red-500")} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Method</label>
            <select
              {...register("method") as any}
              className={cn("w-full rounded-md border bg-background px-3 py-2", errors.method && "border-red-500 focus-visible:ring-red-500")}
            >
              <option value="">Select method</option>
              {METHODS.map((m) => (<option key={m} value={m}>{m}</option>))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Provider</label>
            <select
              {...register("provider") as any}
              className={cn("w-full rounded-md border bg-background px-3 py-2", errors.provider && "border-red-500 focus-visible:ring-red-500")}
              onChange={(e) => {
                const v = e.target.value as FormData["provider"];
                setValue("provider", v as any, { shouldValidate: true });
                setValue("model", "");
              }}
            >
              <option value="">Select provider</option>
              {PROVIDERS.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Model</label>
            <select
              {...register("model") as any}
              className={cn("w-full rounded-md border bg-background px-3 py-2", errors.model && "border-red-500 focus-visible:ring-red-500")}
            >
              <option value="">Select model</option>
              {(watch("provider") === "Anthropic" ? ANTHROPIC_MODELS : OPENAI_MODELS).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">System Prompt</label>
            <Textarea rows={3} placeholder="You are a helpful assistant..." {...register("systemPrompt")} className={cn(errors.systemPrompt && "border-red-500 focus-visible:ring-red-500")} />
          </div>
        </div>
      </Collapsible>

      <div className="flex flex-col gap-3 md:flex-row md:justify-end md:gap-4">
        <Button type="submit" variant="outline" className="w-full md:w-auto px-8" disabled={!isDirty || isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button type="reset" variant="outline" className="w-full md:w-auto px-8" onClick={() => reset()}>
          Reset
        </Button>
      </div>
    </form>
  );
}

export default AdminChatbotDetailConfigurationTab;

