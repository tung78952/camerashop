import Link from "next/link";

import ProductImage from "@/components/ProductImage";
import Stars from "@/components/Stars";

import type { ProductSummary } from "@/lib/api";
import { formatPriceRange } from "@/lib/format";

export default function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="block rounded-lg border bg-white p-4 transition hover:border-red-500 hover:shadow-md"
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded bg-white">
        <ProductImage src={product.imageUrl} name={product.name} brand={product.brand} category={product.category} />
      </div>
      <p className="text-xs text-gray-500">
        {product.brand} · {product.category}
      </p>
      <h3 className="font-semibold">{product.name}</h3>
      {product.mount && <p className="text-xs text-gray-500">Ngàm {product.mount}</p>}
      {product.ratingCount > 0 && (
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <Stars value={product.ratingAverage} size="text-xs" />
          <span>{product.ratingAverage.toLocaleString("vi-VN")} ({product.ratingCount})</span>
        </p>
      )}
      {product.minPrice != null && product.maxPrice != null && (
        <p className="mt-2 font-semibold text-red-600">
          {formatPriceRange(product.minPrice, product.maxPrice)}
        </p>
      )}
    </Link>
  );
}
