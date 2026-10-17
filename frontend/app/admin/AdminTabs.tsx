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
    <nav aria-label="Mục quản trị" className="flex gap-1 rounded-[10px] bg-stone-200/70 p-1">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`flex h-10 items-center rounded-lg px-4.5 text-sm ${
              active ? "bg-surface font-semibold shadow-[0_1px_2px_rgba(28,25,23,.08)]" : "font-medium text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
