"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { Loader2, Save, Send, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CoverImageUploader } from "@/components/admin/blog/cover-image-uploader";
import { blogSchema, type BlogInput } from "@/lib/validations/blog";

// Tiptap is a substantial, browser-only dependency (ProseMirror + several
// extensions) that's only ever used on two admin routes (new/edit post).
// Dynamically importing it keeps it out of the initial admin bundle and out
// of the server render entirely — `ssr: false` avoids the mismatch risk of
// hydrating a contentEditable-based editor that has no meaningful server
// representation anyway.
const RichTextEditor = dynamic(
  () => import("@/components/admin/blog/rich-text-editor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[400px] items-center justify-center rounded-md border border-nomad-steel bg-nomad-charcoal">
        <Loader2 className="h-6 w-6 animate-spin text-nomad-gold" />
      </div>
    ),
  }
);
import {
  createBlogAction,
  updateBlogAction,
  publishBlogAction,
  unpublishBlogAction,
} from "@/app/admin/blog/actions";
import type { Blog, Category } from "@/types";

interface BlogEditorFormProps {
  blog?: Blog;
  categories: Category[];
}

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0]!;
}

export function BlogEditorForm({ blog, categories }: BlogEditorFormProps) {
  const router = useRouter();
  const isEditing = !!blog;
  // A stable per-editor-session ID used to namespace uploaded images in
  // Storage before the post has its own database ID (new posts only).
  const draftId = useMemo(() => blog?.id ?? crypto.randomUUID(), [blog?.id]);

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BlogInput>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: blog?.title ?? "",
      excerpt: blog?.excerpt ?? "",
      content: blog?.content ?? "",
      coverImageUrl: blog?.coverImageUrl ?? "",
      categoryId: blog?.categoryId ?? "",
      rideDate: toDateInputValue(blog?.rideDate),
      location: blog?.location ?? "",
      motorcycle: blog?.motorcycle ?? "",
      distanceKm: blog?.distanceKm ?? undefined,
      metaTitle: blog?.metaTitle ?? "",
      metaDescription: blog?.metaDescription ?? "",
    },
  });

  const coverImageUrl = watch("coverImageUrl");
  const content = watch("content");
  const categoryId = watch("categoryId");

  async function persist(values: BlogInput): Promise<{ id: string; slug: string } | null> {
    if (isEditing) {
      const result = await updateBlogAction(blog.id, values);
      if (!result.success) {
        setFormError(result.error);
        return null;
      }
      return { id: blog.id, slug: result.data.slug };
    }

    const result = await createBlogAction(values);
    if (!result.success) {
      setFormError(result.error);
      return null;
    }
    return result.data;
  }

  async function handleSaveDraft(values: BlogInput) {
    setFormError(null);
    setIsSavingDraft(true);
    const saved = await persist(values);
    setIsSavingDraft(false);

    if (!saved) return;
    toast.success("Draft saved.");
    if (!isEditing) {
      router.push(`/admin/blog/${saved.id}`);
    } else {
      router.refresh();
    }
  }

  async function handlePublish(values: BlogInput) {
    setFormError(null);
    setIsPublishing(true);
    const saved = await persist(values);
    if (!saved) {
      setIsPublishing(false);
      return;
    }

    const publishResult = await publishBlogAction(saved.id);
    setIsPublishing(false);

    if (!publishResult.success) {
      setFormError(publishResult.error);
      return;
    }

    toast.success("Post published.");
    router.push(`/admin/blog/${saved.id}`);
    router.refresh();
  }

  async function handleUnpublish() {
    if (!blog) return;
    const result = await unpublishBlogAction(blog.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message ?? "Moved back to draft.");
    router.refresh();
  }

  return (
    <form className="flex flex-col gap-8" noValidate>
      {formError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-red-400"
        >
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Crossing Khardung La: A Ladakh Ride Report"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              rows={3}
              placeholder="A short teaser shown on the blog listing page..."
              aria-invalid={!!errors.excerpt}
              {...register("excerpt")}
            />
            {errors.excerpt && <p className="text-xs text-red-400">{errors.excerpt.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Content</Label>
            <RichTextEditor
              value={content}
              onChange={(html) => setValue("content", html, { shouldValidate: true })}
              draftId={draftId}
            />
            {errors.content && <p className="text-xs text-red-400">{errors.content.message}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <Label>Cover Image</Label>
            <CoverImageUploader
              value={coverImageUrl}
              onChange={(url) => setValue("coverImageUrl", url, { shouldValidate: true })}
              draftId={draftId}
            />
            {errors.coverImageUrl && <p className="text-xs text-red-400">{errors.coverImageUrl.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <Select
              value={categoryId || "none"}
              onValueChange={(v) => setValue("categoryId", v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Uncategorized" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Uncategorized</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rideDate">Ride Date</Label>
            <Input id="rideDate" type="date" {...register("rideDate")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="Ladakh, India" {...register("location")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="motorcycle">Motorcycle</Label>
            <Input id="motorcycle" placeholder="Royal Enfield Himalayan" {...register("motorcycle")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="distanceKm">Distance (km)</Label>
            <Input id="distanceKm" type="number" min={0} placeholder="1240" {...register("distanceKm")} />
            {errors.distanceKm && <p className="text-xs text-red-400">{errors.distanceKm.message}</p>}
          </div>

          <details className="rounded-md border border-nomad-steel bg-nomad-black/40 p-3">
            <summary className="cursor-pointer text-sm font-medium text-nomad-fog">
              SEO Overrides (optional)
            </summary>
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input id="metaTitle" placeholder="Defaults to post title" {...register("metaTitle")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea id="metaDescription" rows={2} placeholder="Defaults to excerpt" {...register("metaDescription")} />
              </div>
            </div>
          </details>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-nomad-steel pt-6">
        <Button
          type="button"
          variant="outline"
          disabled={isSavingDraft || isPublishing}
          onClick={handleSubmit(handleSaveDraft)}
        >
          {isSavingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Draft
        </Button>
        <Button
          type="button"
          disabled={isSavingDraft || isPublishing}
          onClick={handleSubmit(handlePublish)}
        >
          {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {isEditing && blog.status === "PUBLISHED" ? "Update & Publish" : "Publish"}
        </Button>
        {isEditing && blog.status === "PUBLISHED" && (
          <Button type="button" variant="ghost" onClick={handleUnpublish}>
            <Undo2 className="h-4 w-4" />
            Move Back To Draft
          </Button>
        )}
      </div>
    </form>
  );
}
