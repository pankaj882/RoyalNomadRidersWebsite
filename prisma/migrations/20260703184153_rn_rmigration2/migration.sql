-- AlterTable
ALTER TABLE "users" ADD COLUMN     "display_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "founder_title" TEXT,
ADD COLUMN     "is_founder" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "testimonials" (
    "id" UUID NOT NULL,
    "author_name" TEXT NOT NULL,
    "author_title" TEXT,
    "author_avatar_url" TEXT,
    "quote" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "testimonials_is_approved_is_featured_display_order_idx" ON "testimonials"("is_approved", "is_featured", "display_order");

-- CreateIndex
CREATE INDEX "users_is_founder_display_order_idx" ON "users"("is_founder", "display_order");
