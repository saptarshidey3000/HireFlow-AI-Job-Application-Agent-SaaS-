import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "HireFlow — Your next job application, intelligently handled",
  description:
    "HireFlow uses AI to analyze jobs, tailor your resume, score your fit, discover opportunities, and manage every application from one intelligent workspace.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full dark",
        "antialiased",
        inter.variable,
        instrumentSerif.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full flex flex-col bg-[#1C1C1C] text-[#F5F5F5]">
        {children}
      </body>
    </html>
  );
}
