import Link from "next/link";

import { getAdminProducts, getFilterOptions } from "@/lib/api";

import { Forbidden, requireAdmin } from "../../guard";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
  if (!(await requireAdmin("/admin/products/new"))) {
    return <Forbidden />;
  }
  const [options, products] = await Promise.all([getFilterOptions(), getAdminProducts()]);
  const cameras = products.filter((p) => p.category === "Máy ảnh").map((p) => ({ id: p.id, name: p.name }));

  return (
    <main className="mx-auto w-full max-w-4xl p-6">
      <Link href="/admin/products" className="text-sm text-gray-500 hover:text-red-600">← Quản lý sản phẩm</Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold">Thêm sản phẩm</h1>
      <ProductForm options={options} cameras={cameras} />
    </main>
  );
}
