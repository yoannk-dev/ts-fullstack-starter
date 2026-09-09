import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/api/trpc/client";
import "./globals.css";

const inter = Inter({ variable: "--font-inter" });
const metadataBase = new URL(process.env.SITE_URL ?? "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: "Todos — ts-fullstack-starter",
  description: "Full-stack TypeScript monorepo boilerplate — todo list demo (REST + tRPC)",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
