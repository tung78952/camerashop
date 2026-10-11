"use client";

import Image from "next/image";
import { useState } from "react";

import { imageSrc } from "@/lib/image";

const BRAND_COLORS: Record<string, string> = {
  Sony: "from-neutral-200 to-neutral-300 text-neutral-700",
  Canon: "from-red-100 to-red-200 text-red-800",
  Nikon: "from-yellow-100 to-yellow-200 text-yellow-900",
  Fujifilm: "from-emerald-100 to-emerald-200 text-emerald-900",
  SanDisk: "from-rose-100 to-rose-200 text-rose-900",
};

export default function ProductImage({
  src,
  name,
  brand,
  category,
  sizes = "(max-width: 768px) 50vw, 25vw",
}: {
  src: string | null;
  name: string;
  brand?: string;
  category?: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState<boolean>(false);

  if (src && !failed) {
    return (
      <Image src={imageSrc(src)} alt={name} fill sizes={sizes} unoptimized className="object-contain" onError={() => setFailed(true)} />
    );
  }

  const colors = (brand && BRAND_COLORS[brand]) ?? "from-gray-100 to-gray-200 text-gray-600";
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br p-3 text-center ${colors}`}>
      <CategoryIcon category={category} />
      {brand && <span className="text-xs font-bold uppercase tracking-widest opacity-70">{brand}</span>}
      <span className="line-clamp-2 text-xs font-medium">{name}</span>
    </div>
  );
}

function CategoryIcon({ category }: { category?: string }) {
  const common = { width: 48, height: 48, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
    strokeWidth: 1.5, "aria-hidden": true } as const;
  switch (category) {
    case "Ống kính":
      return (
        <svg {...common}>
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <path d="M5 8h14M5 16h14M9 4v16M15 4v16" />
        </svg>
      );
    case "Pin & sạc":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="16" height="10" rx="2" />
          <path d="M21 10v4M7 10v4M10 10v4" />
        </svg>
      );
    case "Thẻ nhớ":
      return (
        <svg {...common}>
          <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
          <path d="M9 3v4M12 3v4M15 5v2" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      );
  }
}
