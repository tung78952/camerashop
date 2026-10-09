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
    <main className="mx-auto w-full max-w-4xl p-6">
      <Link href="/admin/products" className="text-sm text-gray-500 hover:text-red-600">← Quản lý sản phẩm</Link>
      <div className="mb-6 mt-2 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Sửa: {product.name}</h1>
        {product.active ? (
          <Link href={`/products/${product.id}`} className="text-sm text-red-600 hover:underline">Xem trên web →</Link>
        ) : (
          <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">Đang ẩn — khách không thấy</span>
        )}
      </div>
      <ProductForm key={product.id} options={options} cameras={cameras} initial={product} />
    </main>
  );
}
