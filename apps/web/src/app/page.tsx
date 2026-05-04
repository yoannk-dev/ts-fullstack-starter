"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";

export default function Home() {
  const trpc = useTRPC();
  const { data: posts, isLoading } = useQuery(trpc.post.findAll.queryOptions());

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
        <Link
          href="/posts/new"
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
        >
          + New post
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <ul className="space-y-3">
          {posts?.map((post) => (
            <li
              key={post.id}
              className="group bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-gray-400 hover:shadow-sm transition-all"
            >
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 group-hover:text-black truncate">
                    {post.title}
                  </p>
                  <p className="text-sm text-gray-400 truncate mt-0.5">{post.url}</p>
                </div>
                <span className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0 mt-0.5">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
