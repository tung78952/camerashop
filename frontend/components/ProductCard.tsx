// Product card used in listings: image, brand, name, mount, rating and price range.

import Link from "next/link";

import ProductImage from "@/components/ProductImage";
import Stars from "@/components/Stars";

import type { ProductSummary } from "@/lib/api";
import { formatPriceRange } from "@/lib/format";

export default function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link href={`/products/${product.id}`} className="group flex flex-col gap-0.5 md:gap-1">
      <div className="relative mb-2 aspect-square overflow-hidden rounded-[10px] border border-line bg-surface transition-colors group-hover:border-line-strong md:mb-3">
        <div className="absolute inset-2 md:inset-4">
          <ProductImage src={product.imageUrl} name={product.name} brand={product.brand} category={product.category} />
        </div>
      </div>
      <p className="text-[11px] text-muted md:text-xs">
        {product.brand} · {product.category}
      </p>
      <h3 className="text-sm font-semibold leading-snug text-pretty group-hover:text-accent md:text-[15px]">{product.name}</h3>
      {product.mount && <p className="text-[11px] text-muted md:text-xs">Ngàm {product.mount}</p>}
      {product.ratingCount > 0 && (
        <p className="flex items-center gap-1.5 text-[11px] text-muted md:text-xs">
          <Stars value={product.ratingAverage} size="text-xs md:text-[13px]" />
          <span>{product.ratingAverage.toLocaleString("vi-VN")} ({product.ratingCount})</span>
        </p>
      )}
      {product.minPrice != null && product.maxPrice != null && (
        <p className="price mt-1 text-sm font-bold leading-snug text-accent md:mt-1.5 md:text-base">
          {formatPriceRange(product.minPrice, product.maxPrice)}
        </p>
      )}
    </Link>
  );
}
