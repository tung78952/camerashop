// Category menu that highlights the current category (client component because it reads the URL query); tabs on desktop, scrollable chips on phones.

"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { Option } from "@/lib/api";

export default function CategoryNav({ categories }: { categories: Option[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onHome = pathname === "/";
  const currentId = searchParams.get("categoryId");

  const items = [
    { href: "/", label: "Tất cả", active: onHome && !currentId },
    ...categories.map((category) => ({
      href: `/?categoryId=${category.id}`,
      label: category.name,
      active: onHome && currentId === String(category.id),
    })),
  ];

  return (
    <nav aria-label="Danh mục">
      <div className="mx-auto hidden w-full max-w-300 flex-wrap justify-center gap-10 px-6 text-sm font-medium md:flex">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={`border-b-2 pb-2.5 pt-3 ${
              item.active ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3 text-sm font-medium md:hidden">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={`flex h-9 shrink-0 items-center rounded-full px-4 ${
              item.active ? "bg-ink text-white" : "border border-line bg-surface"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
