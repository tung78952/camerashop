import Link from "next/link";

import FilterSidebar, { type SelectedFilters } from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import { getFilterOptions, getProducts } from "@/lib/api";

export default async function Home({ searchParams }: PageProps<"/">) {
  const url = await searchParams;
  const selected: SelectedFilters = {
    q: readParam(url.q),
    brandId: readParam(url.brandId),
    categoryId: readParam(url.categoryId),
    mountId: readParam(url.mountId),
    price: readParam(url.price),
    order: readParam(url.order),
  };
  const currentPage = Number(readParam(url.page) ?? 0);

  let minPrice: string | undefined;
  let maxPrice: string | undefined;
  if (selected.price) {
    const parts = selected.price.split("-");
    minPrice = parts[0];
    maxPrice = parts[1];
  }

  const data = await getProducts({ ...selected, minPrice, maxPrice, page: currentPage });
  const options = await getFilterOptions();

  return (
    <main className="mx-auto w-full max-w-7xl p-6">
      <h1 className="mb-6 text-2xl font-bold">
        {selected.q ? `Kết quả tìm kiếm: "${selected.q}"` : "Tất cả sản phẩm"}
      </h1>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside>
          <FilterSidebar options={options} selected={selected} />
        </aside>

        <section>
          <p className="mb-4 text-gray-500">{data.totalItems} sản phẩm</p>

          {data.items.length === 0 && (
            <p className="rounded-lg border p-8 text-center text-gray-500">Không có sản phẩm phù hợp với bộ lọc.</p>
          )}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {data.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {data.totalPages > 1 && (
            <nav className="mt-8 flex justify-center gap-2">
              {Array.from({ length: data.totalPages }, (_, i) => (
                <Link
                  key={i}
                  href={pageLink(selected, i)}
                  className={`rounded border px-3 py-1 ${i === currentPage ? "bg-red-600 text-white" : ""}`}
                >
                  {i + 1}
                </Link>
              ))}
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}

function readParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function pageLink(selected: SelectedFilters, page: number): string {
  const params = new URLSearchParams();
  if (selected.q) params.set("q", selected.q);
  if (selected.brandId) params.set("brandId", selected.brandId);
  if (selected.categoryId) params.set("categoryId", selected.categoryId);
  if (selected.mountId) params.set("mountId", selected.mountId);
  if (selected.price) params.set("price", selected.price);
  if (selected.order) params.set("order", selected.order);
  params.set("page", String(page));
  return `/?${params}`;
}
