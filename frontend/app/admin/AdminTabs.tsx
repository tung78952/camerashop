// Admin section switch (segmented control); highlights the open section.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/orders", label: "Đơn hàng" },
  { href: "/admin/products", label: "Sản phẩm" },
];

export default function AdminTabs() {
  const pathname = usePathname();
  return (
    <nav className="mx-auto flex w-full max-w-6xl gap-1 px-6 pt-6">
      <span className="mr-3 self-center text-sm font-semibold text-gray-500">Quản trị:</span>
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              active ? "bg-red-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
