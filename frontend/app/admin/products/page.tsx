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
    <main className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
          <p className="text-sm text-gray-500">{products.length} sản phẩm · {hidden} đã ẩn</p>
        </div>
        <Link href="/admin/products/new" className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
          + Thêm sản phẩm
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Sản phẩm</th>
              <th className="px-4 py-3 text-right">Giá</th>
              <th className="px-4 py-3 text-right">Tồn kho</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id} className={p.active ? "" : "bg-gray-50 text-gray-500"}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded border bg-white">
                      <ProductImage src={p.imageUrl} name={p.name} brand={p.brand} category={p.category} sizes="48px" />
                    </div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-gray-500">#{p.id} · {p.brand} · {p.category} · {p.variantCount} phiên bản</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {p.minPrice != null && p.maxPrice != null ? formatPriceRange(p.minPrice, p.maxPrice) : "—"}
                </td>
                <td className={`px-4 py-3 text-right font-medium ${p.totalStock === 0 ? "text-red-600" : ""}`}>
                  {p.totalStock}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    p.active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}>
                    {p.active ? "Đang bán" : "Đã ẩn"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/products/${p.id}/edit`} className="rounded border px-3 py-1 text-xs font-medium hover:bg-gray-100">
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
