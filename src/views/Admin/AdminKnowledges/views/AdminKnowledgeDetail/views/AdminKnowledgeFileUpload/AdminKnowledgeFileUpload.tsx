"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Upload, X, FileText, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FileItem {
  id: string;
  file: File;
  size: string;
  extension: string;
}

function AdminKnowledgeFileUpload() {
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const params = useParams();
  const knowledgeId = params.knowledgeId as string;

  const allowedTypes = [".pdf", ".txt", ".doc", ".docx"];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toUpperCase() || "";
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach((file) => {
      const extension = `.${getFileExtension(file.name).toLowerCase()}`;
      
      if (!allowedTypes.includes(extension)) {
        alert(`File type ${extension} is not allowed. Please select PDF, TXT, DOC, or DOCX files.`);
        return;
      }
      
      if (file.size > maxFileSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      const fileItem: FileItem = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        size: formatFileSize(file.size),
        extension: getFileExtension(file.name),
      };

      setSelectedFiles((prev) => [...prev, fileItem]);
    });

    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Here you would implement actual file upload logic
      console.log("Uploading files:", selectedFiles);
      
      // Simulate successful upload
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setSelectedFiles([]);
        // Navigate back to knowledge detail
        router.push(`/admin/knowledges/detail/${knowledgeId}`);
      }, 1000);
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    router.push(`/admin/knowledges/detail/${knowledgeId}`);
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
          <li>
            <Link href={`/admin/knowledges/detail/${knowledgeId}`} className="hover:underline">Knowledge Detail</Link>
          </li>
          <li>/</li>
          <li className="text-foreground">Upload Files</li>
        </ol>
      </nav>

      {/* Header with Back Button and Title */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/knowledges/detail/${knowledgeId}`}
          className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold md:text-2xl">Upload Files</h1>
      </div>

      {/* File Upload Section */}
      <div className="space-y-6">
        {/* File Picker */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="file-upload" className="text-sm font-medium">
              Select Files <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-20 border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
                disabled={isUploading}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to select files or drag and drop
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PDF, TXT, DOC, DOCX (Max 10MB each)
                  </span>
                </div>
              </Button>
            </div>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Selected Files ({selectedFiles.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedFiles.map((fileItem) => (
                  <div
                    key={fileItem.id}
                    className="flex items-center justify-between p-3 border border-input rounded-md bg-muted/50"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                            {fileItem.extension}
                          </span>
                          <span>{fileItem.size}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileItem.id)}
                      disabled={isUploading}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-3 p-4 border border-input rounded-md bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading files...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Please wait...</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 md:flex-row md:justify-end md:gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleUpload}
            disabled={isUploading || selectedFiles.length === 0}
            className="w-full md:w-auto px-8"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
            className="w-full md:w-auto px-8"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AdminKnowledgeFileUpload;