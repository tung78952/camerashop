// Admin "new product" page.

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
    <main className="mx-auto w-full max-w-225 px-4 pb-14 pt-6 md:px-6 md:pb-24">
      <Link href="/admin/products" className="text-sm text-muted hover:text-accent">← Quản lý sản phẩm</Link>
      <h2 className="mb-6 mt-2 text-2xl font-bold tracking-tight">Thêm sản phẩm</h2>
      <ProductForm options={options} cameras={cameras} />
    </main>
  );
}
