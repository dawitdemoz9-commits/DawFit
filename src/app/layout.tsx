import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import { AuthHashRedirect } from "@/components/auth-hash-redirect";
import "@/styles/globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DawFit — AI-Powered Coaching Platform",
    template: "%s | DawFit",
  },
  description: "The AI-powered platform for fitness coaches to manage clients, deliver adaptive training programs, and scale their business.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        <AuthHashRedirect />
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
