/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import { Navbar } from "@/components/uiComponents/Navbar";
import { Footer } from "@/components/uiComponents/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Real Estate Analyzer",
  description: "Create, organize, and manage your property investment blocks",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
