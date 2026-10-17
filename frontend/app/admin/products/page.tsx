// Admin products table: all products including hidden ones, with add / edit / hide actions.

import Link from "next/link";

import ProductImage from "@/components/ProductImage";
import { getAdminProducts } from "@/lib/api";
import { formatPriceRange } from "@/lib/format";

import { Forbidden, requireAdmin } from "../guard";
import ToggleActiveButton from "./ToggleActiveButton";

export default async function AdminProductsPage() {
  if (!(await requireAdmin("/admin/products"))) {
    return <Forbidden />;
  }
  const products = await getAdminProducts();
  const hidden = products.filter((p) => !p.active).length;

  return (
    <main className="mx-auto w-full max-w-300 px-4 pb-14 pt-6 md:px-6 md:pb-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{products.length} sản phẩm · {hidden} đã ẩn</p>
        <Link href="/admin/products/new" className="flex h-11 items-center gap-2 rounded-lg bg-accent px-4.5 text-sm font-semibold text-white hover:bg-accent-hover">
          <span aria-hidden="true" className="text-lg leading-none">+</span>
          Thêm sản phẩm
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-205 text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th scope="col" className="py-3 pl-6 pr-4 font-semibold">Sản phẩm</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Giá</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Tồn kho</th>
              <th scope="col" className="px-4 py-3 font-semibold">Trạng thái</th>
              <th scope="col" className="py-3 pl-4 pr-6 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={`border-t border-line align-middle ${p.active ? "hover:bg-bg" : "bg-bg text-muted"}`}>
                <td className="py-3.5 pl-6 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-line bg-surface">
                      <span className="absolute inset-1">
                        <ProductImage src={p.imageUrl} name={p.name} brand={p.brand} category={p.category} sizes="48px" />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted">#{p.id} · {p.brand} · {p.category} · {p.variantCount} phiên bản</p>
                    </div>
                  </div>
                </td>
                <td className="price whitespace-nowrap px-4 py-3.5 text-right">
                  {p.minPrice != null && p.maxPrice != null ? formatPriceRange(p.minPrice, p.maxPrice) : "—"}
                </td>
                <td className={`price px-4 py-3.5 text-right font-semibold ${p.totalStock === 0 ? "text-red-700" : ""}`}>
                  {p.totalStock}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex h-6.5 items-center rounded-full px-2.5 text-xs font-semibold ${
                    p.active ? "bg-green-100 text-green-800" : "bg-line text-ink-2"}`}>
                    {p.active ? "Đang bán" : "Đã ẩn"}
                  </span>
                </td>
                <td className="py-3.5 pl-4 pr-6">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/products/${p.id}/edit`} className="flex h-9 items-center rounded-lg border border-line-strong bg-surface px-3.5 text-[13px] font-semibold text-ink hover:border-ink">
                      Sửa
                    </Link>
                    <ToggleActiveButton productId={p.id} active={p.active} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
