"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { categorySchema, type CategoryInput } from "@/lib/validations/blog";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/app/admin/blog/categories/actions";
import type { Category } from "@/types";

interface CategoryManagerProps {
  categories: Category[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <CategoryForm
            key={editingId ?? "new"}
            category={categories.find((c) => c.id === editingId)}
            onDone={() => {
              setEditingId(null);
              router.refresh();
            }}
            onCancel={() => setEditingId(null)}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {categories.length === 0 ? (
          <p className="rounded-lg border border-dashed border-nomad-steel bg-nomad-charcoal/40 p-8 text-center text-sm text-nomad-ash">
            No categories yet. Create your first one above.
          </p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-nomad-steel bg-nomad-charcoal p-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-nomad-white">{category.name}</p>
                {category.description && (
                  <p className="truncate text-xs text-nomad-ash">{category.description}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button size="sm" variant="ghost" onClick={() => setEditingId(category.id)} aria-label="Edit category">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <ConfirmDialog
                  trigger={
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" aria-label="Delete category">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  }
                  title={`Delete "${category.name}"?`}
                  description="Posts in this category will become uncategorized. This cannot be undone."
                  confirmLabel="Delete Category"
                  onConfirm={async () => {
                    const result = await deleteCategoryAction(category.id);
                    if (!result.success) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success("Category deleted.");
                    router.refresh();
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CategoryForm({
  category,
  onDone,
  onCancel,
}: {
  category?: Category;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
    },
  });

  async function onSubmit(values: CategoryInput) {
    setIsSubmitting(true);
    const result = isEditing
      ? await updateCategoryAction(category.id, values)
      : await createCategoryAction(values);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(result.message ?? "Saved.");
    onDone();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <h3 className="font-display text-lg font-semibold text-nomad-white">
        {isEditing ? "Edit Category" : "New Category"}
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Mountain Rides" aria-invalid={!!errors.name} {...register("name")} />
          {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea id="description" rows={1} placeholder="Short description" {...register("description")} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting} size="sm">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {isEditing ? "Save Changes" : "Create Category"}
        </Button>
        {isEditing && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
