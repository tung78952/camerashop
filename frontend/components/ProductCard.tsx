import Link from "next/link";

import type { ProductSummary } from "@/lib/api";
import { formatPriceRange } from "@/lib/format";

export default function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="block rounded-lg border bg-white p-4 transition hover:border-red-500 hover:shadow-md"
    >
      <div className="mb-3 flex aspect-square items-center justify-center rounded bg-gray-100 text-sm text-gray-400">
        Chưa có ảnh
      </div>
      <p className="text-xs text-gray-500">
        {product.brand} · {product.category}
      </p>
      <h3 className="font-semibold">{product.name}</h3>
      {product.mount && <p className="text-xs text-gray-500">Ngàm {product.mount}</p>}
      {product.minPrice != null && product.maxPrice != null && (
        <p className="mt-2 font-semibold text-red-600">
          {formatPriceRange(product.minPrice, product.maxPrice)}
        </p>
      )}
    </Link>
  );
}
