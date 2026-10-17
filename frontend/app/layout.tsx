// Root layout for every page: header (categories, cart count, session), footer and the chat widget.

import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";

import ChatWidget from "@/components/ChatWidget";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getCart, getFilterOptions, type Option } from "@/lib/api";
import { getSession } from "@/lib/session";

import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TCameraShop",
  description: "Shop máy ảnh, ống kính và phụ kiện",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  let categories: Option[] = [];
  try {
    categories = (await getFilterOptions()).categories;
  } catch {
    categories = [];
  }

  const session = await getSession();

  let cartCount = 0;
  if (session) {
    try {
      cartCount = (await getCart()).totalQuantity;
    } catch {
      cartCount = 0;
    }
  }

  return (
    <html
      lang="vi"
      className={`${beVietnam.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg text-ink">
        <Header categories={categories} cartCount={cartCount} session={session} />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
