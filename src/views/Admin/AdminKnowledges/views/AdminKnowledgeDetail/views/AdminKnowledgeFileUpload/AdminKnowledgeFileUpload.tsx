"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Upload, X, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useKnowledgeFilesControllerCreate } from "@/sdk/knowledge-files/knowledge-files";
import { useKnowledgeFilesControllerAcknowledgeFileUploaded } from "@/sdk/knowledge-files/knowledge-files";

interface FileItem {
  id: string;
  file: File;
  size: string;
  extension: string;
  status: 'pending' | 'creating' | 'uploading' | 'acknowledging' | 'completed' | 'error';
  progress: number;
  error?: string;
  knowledgeFileId?: string;
  uploadUrl?: string;
}

function AdminKnowledgeFileUpload() {
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const params = useParams();
  const knowledgeId = params.knowledgeId as string;
  const queryClient = useQueryClient();

  const createFileMutation = useKnowledgeFilesControllerCreate({
    mutation: {
      onError: (error) => {
        console.error('Failed to create knowledge file:', error);
        toast.error('Failed to create file record');
      },
    },
  });

  const acknowledgeMutation = useKnowledgeFilesControllerAcknowledgeFileUploaded({
    mutation: {
      onError: (error) => {
        console.error('Failed to acknowledge upload:', error);
        toast.error('Failed to acknowledge file upload');
      },
    },
  });

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
        status: 'pending',
        progress: 0,
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

  const updateFileStatus = (fileId: string, updates: Partial<FileItem>) => {
    setSelectedFiles(prev => 
      prev.map(file => 
        file.id === fileId ? { ...file, ...updates } : file
      )
    );
  };

  const uploadFileToStorage = async (file: File, uploadUrl: string, fileId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          updateFileStatus(fileId, { progress });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  };

  const processFileUpload = async (fileItem: FileItem): Promise<void> => {
    try {
      // Step 1: Create knowledge file record
      updateFileStatus(fileItem.id, { status: 'creating', progress: 0 });
      
      const createResponse = await createFileMutation.mutateAsync({
        data: {
          knowledgeId,
          fileName: fileItem.file.name,
          fileType: fileItem.file.type,
          fileSize: fileItem.file.size,
          isActive: true,
        }
      });

      const { knowledgeFile, uploadUrl, method } = createResponse.data;
      
      updateFileStatus(fileItem.id, { 
        status: 'uploading', 
        progress: 0,
        knowledgeFileId: knowledgeFile.id,
        uploadUrl 
      });

      // Step 2: Upload file to presigned URL
      await uploadFileToStorage(fileItem.file, uploadUrl, fileItem.id);
      
      updateFileStatus(fileItem.id, { 
        status: 'acknowledging', 
        progress: 90 
      });

      // Step 3: Acknowledge upload
      await acknowledgeMutation.mutateAsync({
        id: knowledgeFile.id,
        data: {
          id: knowledgeFile.id,
          fileSize: fileItem.file.size,
        }
      });

      updateFileStatus(fileItem.id, { 
        status: 'completed', 
        progress: 100 
      });

    } catch (error) {
      console.error(`Upload failed for ${fileItem.file.name}:`, error);
      updateFileStatus(fileItem.id, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Upload failed'
      });
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file to upload.");
      return;
    }

    setIsUploading(true);

    try {
      // Process files one by one
      for (const fileItem of selectedFiles) {
        if (fileItem.status === 'pending') {
          await processFileUpload(fileItem);
        }
      }

      // Check if all files completed successfully
      const allCompleted = selectedFiles.every(file => file.status === 'completed');
      const hasErrors = selectedFiles.some(file => file.status === 'error');

      if (allCompleted) {
        toast.success("All files uploaded successfully!");
        // Invalidate knowledge files queries
        await queryClient.invalidateQueries({ 
          predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]).includes("/knowledge-files") 
        });
        // Navigate back to knowledge detail
        router.push(`/admin/knowledges/detail/${knowledgeId}`);
      } else if (hasErrors) {
        toast.error("Some files failed to upload. Please check the status and try again.");
      }

    } catch (error) {
      console.error("Upload process failed:", error);
      toast.error("Upload process failed");
    } finally {
      setIsUploading(false);
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
                    className="p-3 border border-input rounded-md bg-muted/50"
                  >
                    <div className="flex items-center justify-between mb-2">
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
                      <div className="flex items-center gap-2">
                        {/* Status Icon */}
                        {fileItem.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {fileItem.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        {(fileItem.status === 'creating' || fileItem.status === 'uploading' || fileItem.status === 'acknowledging') && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(fileItem.id)}
                          disabled={isUploading && fileItem.status !== 'pending'}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Status and Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {fileItem.status === 'pending' && 'Ready to upload'}
                          {fileItem.status === 'creating' && 'Creating file record...'}
                          {fileItem.status === 'uploading' && 'Uploading to storage...'}
                          {fileItem.status === 'acknowledging' && 'Finalizing upload...'}
                          {fileItem.status === 'completed' && 'Upload completed'}
                          {fileItem.status === 'error' && `Error: ${fileItem.error || 'Upload failed'}`}
                        </span>
                        <span className="text-muted-foreground">{fileItem.progress}%</span>
                      </div>
                      
                      {/* Progress Bar */}
                      {(fileItem.status === 'creating' || fileItem.status === 'uploading' || fileItem.status === 'acknowledging') && (
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${fileItem.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
            disabled={isUploading || selectedFiles.length === 0 || selectedFiles.every(f => f.status !== 'pending')}
            className="w-full md:w-auto px-8"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
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