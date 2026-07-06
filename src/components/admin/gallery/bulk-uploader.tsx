"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  uploadGalleryImage,
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE_BYTES,
  type UploadedGalleryImage,
} from "@/lib/gallery-upload";
import { createGalleryImagesAction } from "@/app/admin/gallery/actions";

interface BulkUploaderProps {
  albumId: string;
  albumTitle: string;
}

interface FileTask {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

// Uploads run with limited concurrency rather than all at once — this keeps
// a 30-photo bulk upload from opening 30 simultaneous connections (which on
// slower mobile networks tends to cause timeouts and browser throttling).
const UPLOAD_CONCURRENCY = 3;

export function BulkUploader({ albumId, albumTitle }: BulkUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [tasks, setTasks] = useState<FileTask[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateFiles = useCallback((files: File[]): { valid: File[]; rejected: string[] } => {
    const valid: File[] = [];
    const rejected: string[] = [];

    for (const file of files) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        rejected.push(`${file.name} — unsupported file type`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        rejected.push(`${file.name} — exceeds 15MB limit`);
        continue;
      }
      valid.push(file);
    }

    return { valid, rejected };
  }, []);

  async function processFiles(files: File[]) {
    const { valid, rejected } = validateFiles(files);

    rejected.forEach((message) => toast.error(message));
    if (valid.length === 0) return;

    const initialTasks: FileTask[] = valid.map((file) => ({ file, status: "pending" }));
    setTasks(initialTasks);
    setIsProcessing(true);

    const uploaded: UploadedGalleryImage[] = [];
    const queue = [...valid];

    async function worker() {
      while (queue.length > 0) {
        const file = queue.shift();
        if (!file) return;

        setTasks((prev) =>
          prev.map((task) => (task.file === file ? { ...task, status: "uploading" } : task))
        );

        try {
          const result = await uploadGalleryImage(file, albumId, albumTitle);
          uploaded.push(result);
          setTasks((prev) =>
            prev.map((task) => (task.file === file ? { ...task, status: "done" } : task))
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : "Upload failed";
          setTasks((prev) =>
            prev.map((task) => (task.file === file ? { ...task, status: "error", error: message } : task))
          );
        }
      }
    }

    await Promise.all(Array.from({ length: UPLOAD_CONCURRENCY }, () => worker()));

    if (uploaded.length > 0) {
      const result = await createGalleryImagesAction({ albumId, images: uploaded });
      if (result.success) {
        toast.success(result.message ?? `${uploaded.length} photos uploaded.`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    }

    setIsProcessing(false);
  }

  function handleFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) processFiles(files);
    event.target.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) processFiles(files);
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 text-center transition-colors",
          isDragging ? "border-nomad-red bg-nomad-red/5" : "border-nomad-steel bg-nomad-charcoal/40"
        )}
      >
        <UploadCloud className="h-8 w-8 text-nomad-red" />
        <div>
          <p className="text-sm font-medium text-nomad-white">Drag & drop photos here</p>
          <p className="text-xs text-nomad-ash">JPEG, PNG, WebP, or AVIF · up to 15MB each · up to 50 at once</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          Browse Files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {tasks.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border border-nomad-steel bg-nomad-charcoal p-4">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 flex-1 truncate text-nomad-fog">{task.file.name}</span>
              {task.status === "pending" && <span className="text-xs text-nomad-ash">Waiting...</span>}
              {task.status === "uploading" && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-nomad-red" />}
              {task.status === "done" && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
              {task.status === "error" && (
                <span className="flex shrink-0 items-center gap-1.5 text-xs text-red-400">
                  <XCircle className="h-4 w-4" /> {task.error}
                </span>
              )}
            </div>
          ))}
          {!isProcessing && (
            <Button type="button" variant="ghost" size="sm" className="mt-2 w-fit" onClick={() => setTasks([])}>
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
