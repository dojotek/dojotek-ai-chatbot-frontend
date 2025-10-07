"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Collapsible } from "@/components/ui/collapsible";
import { useParams, useRouter } from "next/navigation";
import { useChannelsControllerCreate, useChannelsControllerFindOne, useChannelsControllerUpdate } from "@/sdk/channels/channels";
import { useChatAgentsControllerFindAll } from "@/sdk/chat-agents/chat-agents";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ChannelPlatform } from "@/sdk/models";

// Form validation schema for the form (with string isActive)
const channelFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  chatAgentId: z.string().min(1, "Chat Agent is required"),
  platform: z.enum(["slack", "discord", "teams", "lark", "telegram", "whatsapp"]),
  workspaceId: z.string().min(1, "Workspace ID is required").max(255, "Workspace ID must be less than 255 characters"),
  description: z.string().optional(),
  isActive: z.string(),
});

// Schema for the API payload (with boolean isActive)
const channelSchema = channelFormSchema.transform((data) => ({
  ...data,
  isActive: data.isActive === "true",
}));

type ChannelFormData = z.infer<typeof channelFormSchema>;
type ChannelPayload = z.infer<typeof channelSchema>;

const PLATFORM_OPTIONS: { value: ChannelPlatform; label: string }[] = [
  { value: "slack", label: "Slack" },
  { value: "discord", label: "Discord" },
  { value: "teams", label: "Microsoft Teams" },
  { value: "lark", label: "Lark" },
  { value: "telegram", label: "Telegram" },
  { value: "whatsapp", label: "WhatsApp" },
];

function AdminChannel() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const params = useParams<{ id?: string }>();
  const channelId = params?.id as string | undefined;
  const isEditMode = Boolean(channelId);
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    watch,
    setValue,
  } = useForm<ChannelFormData>({
    resolver: zodResolver(channelFormSchema),
    defaultValues: {
      name: "",
      chatAgentId: "",
      platform: "slack",
      workspaceId: "",
      description: "",
      isActive: "true",
    },
    mode: "onChange",
  });

  const { data: getOneResp } = useChannelsControllerFindOne(channelId ?? "", {
    query: {
      enabled: isEditMode,
    },
  });

  // Get chat agents for the dropdown
  const { data: chatAgentsData } = useChatAgentsControllerFindAll(
    {
      skip: 0,
      take: 1000,
      search: "",
      customerId: "",
    },
    {
      query: {},
    }
  );

  useEffect(() => {
    const channel = getOneResp?.data;
    if (!channel) return;
    reset({
      name: channel.name ?? "",
      chatAgentId: channel.chatAgentId ?? "",
      platform: channel.platform ?? "slack",
      workspaceId: channel.workspaceId ?? "",
      description: typeof channel.description === "string" ? channel.description : "",
      isActive: channel.isActive ? "true" : "false",
    });
  }, [getOneResp, reset]);

  const createMutation = useChannelsControllerCreate({
    mutation: {
      onSuccess: async (resp) => {
        toast.success("Channel created", { duration: 2500 });
        await queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]).includes("/channels") });
        const newId = resp.data.id;
        if (newId) {
          router.replace(`/admin/channels/edit/${newId}`);
        }
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to create channel";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  const updateMutation = useChannelsControllerUpdate({
    mutation: {
      onSuccess: async () => {
        toast.success("Channel updated", { duration: 2500 });
        await queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]).includes("/channels") });
      },
      onError: (err) => {
        const message = (err as any)?.response?.data?.message || "Failed to update channel";
        toast.error(message, { duration: 3000 });
      },
    },
  });

  const onSubmit = async (data: ChannelFormData) => {
    setIsSubmitting(true);
    try {
      // Transform the form data to API payload using the schema
      const payload = channelSchema.parse(data);

      if (isEditMode && channelId) {
        updateMutation.mutate({ id: channelId, data: payload });
      } else {
        createMutation.mutate({ data: payload });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    router.push("/admin/channels");
  };

  const isSaving = isSubmitting || createMutation.isPending || updateMutation.isPending;

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
            <Link href="/admin/channels" className="hover:underline">Channels</Link>
          </li>
          <li>/</li>
          <li className="text-foreground">Channel Details</li>
        </ol>
      </nav>

      {/* Header with Back Button and Title */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/channels"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold md:text-2xl">Channel Details {isEditMode ? "(Edit)" : "(Create)"}</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Collapsible Section */}
        <Collapsible title="Channel Information" defaultOpen={true}>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter channel name"
                className={cn(
                  errors.name && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Chat Agent Field */}
            <div className="space-y-2">
              <label htmlFor="chatAgentId" className="text-sm font-medium">
                Chat Agent <span className="text-red-500">*</span>
              </label>
              <Select
                id="chatAgentId"
                {...register("chatAgentId")}
                className={cn(
                  errors.chatAgentId && "border-red-500 focus-visible:ring-red-500"
                )}
              >
                <option value="">Select a chat agent</option>
                {(chatAgentsData?.data ?? []).map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </Select>
              {errors.chatAgentId && (
                <p className="text-sm text-red-500">{errors.chatAgentId.message}</p>
              )}
            </div>

            {/* Platform Field */}
            <div className="space-y-2">
              <label htmlFor="platform" className="text-sm font-medium">
                Platform <span className="text-red-500">*</span>
              </label>
              <Select
                id="platform"
                {...register("platform")}
                className={cn(
                  errors.platform && "border-red-500 focus-visible:ring-red-500"
                )}
              >
                {PLATFORM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {errors.platform && (
                <p className="text-sm text-red-500">{errors.platform.message}</p>
              )}
            </div>

            {/* Workspace ID Field */}
            <div className="space-y-2">
              <label htmlFor="workspaceId" className="text-sm font-medium">
                Workspace ID <span className="text-red-500">*</span>
              </label>
              <Input
                id="workspaceId"
                {...register("workspaceId")}
                placeholder="Enter workspace ID"
                className={cn(
                  errors.workspaceId && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.workspaceId && (
                <p className="text-sm text-red-500">{errors.workspaceId.message}</p>
              )}
            </div>

            {/* Description Field - Full Width */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter channel description..."
                rows={3}
                className={cn(
                  errors.description && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Status Field */}
            <div className="space-y-2">
              <label htmlFor="isActive" className="text-sm font-medium">
                Status <span className="text-red-500">*</span>
              </label>
              <Select
                id="isActive"
                {...register("isActive")}
                className={cn(
                  errors.isActive && "border-red-500 focus-visible:ring-red-500"
                )}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
              {errors.isActive && (
                <p className="text-sm text-red-500">{errors.isActive.message}</p>
              )}
            </div>
          </div>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 md:flex-row md:justify-end md:gap-4">
          <Button
            type="submit"
            variant="outline"
            disabled={isSaving || !isValid || (!isEditMode && !isValid) || (isEditMode && !isDirty)}
            className="w-full md:w-auto px-8"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
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

export default AdminChannel;