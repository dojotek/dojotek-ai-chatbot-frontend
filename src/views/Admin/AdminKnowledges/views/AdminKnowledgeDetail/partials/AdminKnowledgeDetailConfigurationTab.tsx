"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Collapsible } from "@/components/ui/collapsible";

// Form validation schema
const configurationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  model: z.string().min(1, "Model is required"),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().min(1),
  chunkSize: z.number().min(100),
  chunkOverlap: z.number().min(0),
  embeddingModel: z.string().min(1, "Embedding model is required"),
});

type ConfigurationFormData = z.infer<typeof configurationSchema>;

function AdminKnowledgeDetailConfigurationTab() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ConfigurationFormData>({
    resolver: zodResolver(configurationSchema),
    defaultValues: {
      name: "Company Knowledge Base",
      description: "Internal knowledge base for company policies and procedures",
      model: "gpt-4",
      temperature: 0.7,
      maxTokens: 2000,
      chunkSize: 1000,
      chunkOverlap: 200,
      embeddingModel: "text-embedding-ada-002",
    },
  });

  const temperature = watch("temperature");

  const onSubmit = async (data: ConfigurationFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Configuration saved:", data);
    } catch (error) {
      console.error("Error saving configuration:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Collapsible title="Basic Information" defaultOpen={true}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter knowledge base name"
                className={cn(
                  errors.name && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="model" className="text-sm font-medium">
                AI Model <span className="text-red-500">*</span>
              </label>
              <Select
                id="model"
                {...register("model")}
                className={cn(
                  errors.model && "border-red-500 focus-visible:ring-red-500"
                )}
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3">Claude 3</option>
              </Select>
              {errors.model && (
                <p className="text-sm text-red-500">{errors.model.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter knowledge base description"
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

        {/* AI Parameters */}
        <Collapsible title="AI Parameters" defaultOpen={true}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="temperature" className="text-sm font-medium">
                Temperature: {temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                {...register("temperature", { valueAsNumber: true })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>More Focused</span>
                <span>More Creative</span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="maxTokens" className="text-sm font-medium">
                Max Tokens <span className="text-red-500">*</span>
              </label>
              <Input
                id="maxTokens"
                type="number"
                {...register("maxTokens", { valueAsNumber: true })}
                placeholder="2000"
                className={cn(
                  errors.maxTokens && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.maxTokens && (
                <p className="text-sm text-red-500">{errors.maxTokens.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="embeddingModel" className="text-sm font-medium">
                Embedding Model <span className="text-red-500">*</span>
              </label>
              <Select
                id="embeddingModel"
                {...register("embeddingModel")}
                className={cn(
                  errors.embeddingModel && "border-red-500 focus-visible:ring-red-500"
                )}
              >
                <option value="text-embedding-ada-002">text-embedding-ada-002</option>
                <option value="text-embedding-3-small">text-embedding-3-small</option>
                <option value="text-embedding-3-large">text-embedding-3-large</option>
              </Select>
              {errors.embeddingModel && (
                <p className="text-sm text-red-500">{errors.embeddingModel.message}</p>
              )}
            </div>
          </div>
        </Collapsible>

        {/* Document Processing */}
        <Collapsible title="Document Processing" defaultOpen={false}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="chunkSize" className="text-sm font-medium">
                Chunk Size <span className="text-red-500">*</span>
              </label>
              <Input
                id="chunkSize"
                type="number"
                {...register("chunkSize", { valueAsNumber: true })}
                placeholder="1000"
                className={cn(
                  errors.chunkSize && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.chunkSize && (
                <p className="text-sm text-red-500">{errors.chunkSize.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="chunkOverlap" className="text-sm font-medium">
                Chunk Overlap <span className="text-red-500">*</span>
              </label>
              <Input
                id="chunkOverlap"
                type="number"
                {...register("chunkOverlap", { valueAsNumber: true })}
                placeholder="200"
                className={cn(
                  errors.chunkOverlap && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.chunkOverlap && (
                <p className="text-sm text-red-500">{errors.chunkOverlap.message}</p>
              )}
            </div>
          </div>
        </Collapsible>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AdminKnowledgeDetailConfigurationTab;