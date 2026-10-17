// Admin "edit product" page.

import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminProduct, getAdminProducts, getFilterOptions } from "@/lib/api";

import { Forbidden, requireAdmin } from "../../../guard";
import ProductForm from "../../ProductForm";

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]/edit">) {
  const { id } = await params;
  if (!(await requireAdmin(`/admin/products/${id}/edit`))) {
    return <Forbidden />;
  }
  const [product, options, products] = await Promise.all([getAdminProduct(id), getFilterOptions(), getAdminProducts()]);
  if (!product) {
    notFound();
  }
  const cameras = products.filter((p) => p.category === "Máy ảnh").map((p) => ({ id: p.id, name: p.name }));

  return (
    <main className="mx-auto w-full max-w-225 px-4 pb-14 pt-6 md:px-6 md:pb-24">
      <Link href="/admin/products" className="text-sm text-muted hover:text-accent">← Quản lý sản phẩm</Link>
      <div className="mb-6 mt-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Sửa: {product.name}</h2>
        {product.active ? (
          <Link href={`/products/${product.id}`} className="text-sm font-medium text-accent hover:underline">Xem trên web →</Link>
        ) : (
          <span className="inline-flex h-6.5 items-center rounded-full bg-line px-2.5 text-xs font-semibold text-ink-2">Đang ẩn — khách không thấy</span>
        )}
      </div>
      <ProductForm key={product.id} options={options} cameras={cameras} initial={product} />
    </main>
  );
}
