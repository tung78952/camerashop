// Home / catalog page: filters, product grid and pagination driven by URL query parameters.

import Link from "next/link";

import FilterSidebar, {
  countActive,
  DESKTOP_FORM_ID,
  FilterChips,
  MOBILE_FORM_ID,
  type SelectedFilters,
} from "@/components/FilterSidebar";
import MobileFilterSheet from "@/components/MobileFilterSheet";
import ProductCard from "@/components/ProductCard";
import SortSelect from "@/components/SortSelect";
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

  const isEmpty = data.items.length === 0;
  return (
    <main className="mx-auto w-full max-w-300 px-4 pb-12 pt-6 md:px-6 md:pb-18 md:pt-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4 md:mb-8">
        <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
          <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-[32px]">
            {selected.q ? `Kết quả tìm kiếm: “${selected.q}”` : "Tất cả sản phẩm"}
          </h1>
          <span className="text-[13px] text-muted md:text-sm">{data.totalItems} sản phẩm</span>
        </div>
        <label className="hidden items-center gap-2.5 text-sm text-muted md:flex">
          Sắp xếp
          <SortSelect formId={DESKTOP_FORM_ID} value={selected.order} />
        </label>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2.5 md:hidden">
        <MobileFilterSheet activeCount={countActive(selected)}>
          <FilterChips options={options} selected={selected} />
        </MobileFilterSheet>
        <SortSelect formId={MOBILE_FORM_ID} value={selected.order} className="h-11 rounded-lg" />
      </div>

      <div className="flex items-start gap-12">
        <aside className="hidden w-55 shrink-0 md:block">
          <FilterSidebar options={options} selected={selected} />
        </aside>

        <section aria-label="Danh sách sản phẩm" className="min-w-0 flex-1">
          {isEmpty ? (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-line bg-surface px-6 py-16 text-center">
              <span aria-hidden="true" className="flex size-18 items-center justify-center rounded-full bg-soft text-stone-400">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5M8 11h6" />
                </svg>
              </span>
              <h2 className="text-xl font-bold">Không có sản phẩm phù hợp</h2>
              <p className="text-ink-2">Thử bỏ bớt bộ lọc hoặc tìm bằng từ khóa khác.</p>
              <Link href="/" className="flex h-12 items-center rounded-lg bg-ink px-6 font-semibold text-white hover:bg-ink-2">
                Xem tất cả sản phẩm
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] md:gap-x-6 md:gap-y-10">
              {data.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {data.totalPages > 1 && (
            <nav aria-label="Phân trang" className="mt-10 flex justify-center gap-2 md:mt-14">
              {currentPage > 0 && (
                <PageButton href={pageLink(selected, currentPage - 1)} label="Trang trước">
                  <ArrowIcon direction="left" />
                </PageButton>
              )}
              {Array.from({ length: data.totalPages }, (_, i) => (
                <PageButton key={i} href={pageLink(selected, i)} current={i === currentPage}>
                  {i + 1}
                </PageButton>
              ))}
              {currentPage < data.totalPages - 1 && (
                <PageButton href={pageLink(selected, currentPage + 1)} label="Trang sau">
                  <ArrowIcon direction="right" />
                </PageButton>
              )}
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}

// One pagination button (current page highlighted).
function PageButton({ href, current = false, label, children }: { href: string; current?: boolean; label?: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      className={`flex size-11 items-center justify-center rounded-md text-sm ${
        current ? "bg-ink font-semibold text-white" : "border border-line bg-surface hover:border-line-strong"
      }`}
    >
      {children}
    </Link>
  );
}

// Previous/next arrow.
function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d={direction === "left" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
    </svg>
  );
}

// Reads one query parameter as a string.
function readParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

// Link to another page that keeps the current filters.
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
