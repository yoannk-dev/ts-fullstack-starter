"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import { CreatePostSchema } from "@repo/types";
import type { z } from "zod";

const FormSchema = CreatePostSchema.omit({ authorId: true });
type FormValues = z.infer<typeof FormSchema>;

export default function NewPostPage() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  const { mutateAsync, error } = useMutation(trpc.post.create.mutationOptions());

  const onSubmit = async (values: FormValues) => {
    await mutateAsync({ ...values, authorId: 1 });
    await queryClient.invalidateQueries(trpc.post.findAll.queryFilter());
    router.push("/");
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <button
          onClick={() => {
            router.back();
          }}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4 flex items-center gap-1"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold tracking-tight">New post</h1>
      </div>

      <form
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        className="space-y-5"
      >
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="Post title"
            {...register("title")}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
          {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="url" className="text-sm font-medium text-gray-700">
            URL
          </label>
          <input
            id="url"
            type="url"
            placeholder="https://example.com"
            {...register("url")}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
          {errors.url && <p className="text-xs text-red-500">{errors.url.message}</p>}
        </div>

        {error && <p className="text-sm text-red-500">Something went wrong. Please try again.</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Publishing…" : "Publish post"}
        </button>
      </form>
    </main>
  );
}
