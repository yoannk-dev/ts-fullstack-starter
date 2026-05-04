import type { Metadata } from "next";
import { Providers } from "@/lib/trpc/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ts-fullstack-starter",
  description: "Full-stack TypeScript monorepo boilerplate",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
