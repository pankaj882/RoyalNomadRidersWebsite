import type {
  User,
  Role,
  Album,
  GalleryImage,
  Blog,
  BlogStatus,
  Category,
  Comment,
  Event,
  EventDifficulty,
  EventStatus,
  Registration,
  RegistrationStatus,
  RidingExperience,
  Notification,
  NotificationType,
  Newsletter,
  Contact,
  ContactStatus,
  Testimonial,
  BlogLike,
} from "@prisma/client";

export type {
  User,
  Role,
  Album,
  GalleryImage,
  Blog,
  BlogStatus,
  Category,
  Comment,
  Event,
  EventDifficulty,
  EventStatus,
  Registration,
  RegistrationStatus,
  RidingExperience,
  Notification,
  NotificationType,
  Newsletter,
  Contact,
  ContactStatus,
  Testimonial,
  BlogLike,
};

/** The authenticated app user: Supabase auth identity + Prisma profile/role. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: Role;
}

/** Standard shape returned by Server Actions for form submissions. */
export type ActionResult<TData = undefined> =
  | { success: true; data: TData; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/** Pagination metadata used by list endpoints (gallery, blog, events). */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

/** Blog with its relations commonly needed for card/detail rendering. */
export type BlogWithRelations = Blog & {
  author: Pick<User, "id" | "name" | "avatarUrl">;
  category: Category | null;
  _count?: { comments: number };
};

/** Event with computed seat availability for the registration UI. */
export type EventWithAvailability = Event & {
  seatsRemaining: number;
  _count?: { registrations: number };
};

/** Album with a preview of its images for gallery grid rendering. */
export type AlbumWithPreview = Album & {
  images: GalleryImage[];
  _count?: { images: number };
};

/** A comment with its author and one level of nested replies (also with authors). */
export type CommentWithAuthor = Comment & {
  author: Pick<User, "id" | "name" | "avatarUrl">;
  replies: (Comment & { author: Pick<User, "id" | "name" | "avatarUrl"> })[];
};
