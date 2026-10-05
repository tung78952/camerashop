import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getCart, getFilterOptions, type Option } from "@/lib/api";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CameraShop",
  description: "Shop máy ảnh, ống kính và phụ kiện",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  let categories: Option[] = [];
  try {
    categories = (await getFilterOptions()).categories;
  } catch {
    categories = [];
  }

  let cartCount = 0;
  try {
    cartCount = (await getCart()).totalQuantity;
  } catch {
    cartCount = 0;
  }

  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-neutral-50">
        <Header categories={categories} cartCount={cartCount} />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
