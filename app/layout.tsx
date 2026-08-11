import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "HireFlow — AI Job Application Agent",
  description:
    "HireFlow is an AI-powered job application SaaS platform for modern career tooling.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full dark", "antialiased", inter.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col bg-[#1C1C1C] text-[#F5F5F5]">
        {children}
      </body>
    </html>
  );
}
