import type { ReactNode } from "react";
import { BackButton } from "@/components/back-button";

const TodoIdLayout = ({ children }: { children: ReactNode }) => (
  <main className="max-w-2xl mx-auto px-4 py-12">
    <BackButton />
    {children}
  </main>
);

export default TodoIdLayout;
