import Link from "next/link";

import { getProducts } from "@/lib/api";
import { formatPriceRange } from "@/lib/format";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { page } = await searchParams;
  const currentPage = Number(page ?? 0);

  const data = await getProducts(currentPage);

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <h1 className="mb-2 text-3xl font-bold">CameraShop</h1>
      <p className="mb-6 text-gray-500">{data.totalItems} sản phẩm</p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {data.items.map((product) => (
          <div key={product.id} className="rounded-lg border p-4">
            <div className="mb-3 flex aspect-square items-center justify-center rounded bg-gray-100 text-sm text-gray-400">
              Chưa có ảnh
            </div>
            <p className="text-xs text-gray-500">
              {product.brand} · {product.category}
            </p>
            <h2 className="font-semibold">{product.name}</h2>
            {product.mount && <p className="text-xs text-gray-500">Ngàm {product.mount}</p>}
            {product.minPrice != null && product.maxPrice != null && (
              <p className="mt-2 font-semibold text-red-600">
                {formatPriceRange(product.minPrice, product.maxPrice)}
              </p>
            )}
          </div>
        ))}
      </div>

      <nav className="mt-8 flex justify-center gap-2">
        {Array.from({ length: data.totalPages }, (_, i) => (
          <Link
            key={i}
            href={`/?page=${i}`}
            className={`rounded border px-3 py-1 ${i === currentPage ? "bg-black text-white" : ""}`}
          >
            {i + 1}
          </Link>
        ))}
      </nav>
    </main>
  );
}
