import Link from "next/link";

import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";

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
          <ProductCard key={product.id} product={product} />
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
