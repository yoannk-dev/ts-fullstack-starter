"use client";

import { useRouter } from "next/navigation";

export const BackButton = () => {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        router.back();
      }}
      className="text-sm text-gray-600 hover:text-gray-800 transition-colors mb-4 flex items-center gap-1 cursor-pointer"
    >
      ← Back to previous page
    </button>
  );
};
