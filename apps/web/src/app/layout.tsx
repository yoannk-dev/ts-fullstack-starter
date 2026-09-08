import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/lib/trpc/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const metadataBase = new URL(process.env.SITE_URL ?? "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: "Todos — ts-fullstack-starter",
  description: "Full-stack TypeScript monorepo boilerplate — todo list demo (REST + tRPC)",
  openGraph: {
    title: "Todos — ts-fullstack-starter",
    description: "Full-stack TypeScript monorepo boilerplate — todo list demo (REST + tRPC)",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
