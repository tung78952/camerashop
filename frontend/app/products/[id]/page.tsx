import Link from "next/link";
import { notFound } from "next/navigation";

import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import SpecTable from "@/components/SpecTable";
import { getProductDetail } from "@/lib/api";

import VariantPicker from "./VariantPicker";

export default async function ProductPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  const product = await getProductDetail(id);

  if (!product) {
    notFound();
  }

  const compatibleTitle =
    product.category === "Máy ảnh" ? "Ống kính & phụ kiện dùng được với máy này" : "Dùng được với các máy ảnh";

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-red-600">Trang chủ</Link> / {product.category} / {product.name}
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery
          images={product.images} mainImage={product.imageUrl}
          name={product.name} brand={product.brand} category={product.category}
        />

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {product.brand} · {product.category}
            {product.mount && ` · Ngàm ${product.mount}`}
          </p>
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <VariantPicker variants={product.variants} />

          {product.description && (
            <div className="border-t pt-4">
              <h2 className="mb-2 font-semibold">Mô tả</h2>
              <p className="whitespace-pre-line text-gray-700">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {product.specs.length > 0 && <SpecTable specs={product.specs} />}

      {product.compatibleProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">{compatibleTitle}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {product.compatibleProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
