"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";

export default function Home() {
  const trpc = useTRPC();
  const { data: posts, isLoading } = useQuery(trpc.post.findAll.queryOptions());

  if (isLoading) return <p>Loading...</p>;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Posts</h1>
      <ul className="space-y-2">
        {posts?.map((post) => (
          <li key={post.id} className="border p-4 rounded">
            <a href={post.url} className="font-medium hover:underline">
              {post.title}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
