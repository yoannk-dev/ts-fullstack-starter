import { z } from "zod";

export const PostSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(255),
  url: z.string().url(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Post = z.infer<typeof PostSchema>;

export const CreatePostSchema = PostSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;

export const UpdatePostSchema = PostSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).partial();

export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
