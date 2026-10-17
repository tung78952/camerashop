// Product detail page: gallery, variant picker, specs, reviews and compatible products.

import Link from "next/link";
import { notFound } from "next/navigation";

import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import SpecTable from "@/components/SpecTable";
import Stars from "@/components/Stars";
import { getProductDetail, getProductReviews } from "@/lib/api";

import ReviewSection from "./ReviewSection";
import VariantPicker from "./VariantPicker";

export default async function ProductPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  const product = await getProductDetail(id);

  if (!product) {
    notFound();
  }
  const reviews = await getProductReviews(product.id);

  const compatibleTitle =
    product.category === "Máy ảnh" ? "Ống kính & phụ kiện dùng được với máy này" : "Dùng được với các máy ảnh";

  return (
    <main className="mx-auto w-full max-w-300 px-4 pb-14 pt-4 md:px-6 md:pb-20 md:pt-6">
      <nav aria-label="Đường dẫn" className="mb-5 flex flex-wrap gap-2 text-[13px] text-muted md:mb-6">
        <Link href="/" className="hover:text-accent">Trang chủ</Link>
        <span aria-hidden="true">/</span>
        <span>{product.category}</span>
        <span aria-hidden="true">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-6 md:grid-cols-2 md:gap-14">
        <ProductGallery
          images={product.images} mainImage={product.imageUrl}
          name={product.name} brand={product.brand} category={product.category}
        />

        <section aria-label="Thông tin sản phẩm" className="flex min-w-0 flex-col">
          <p className="text-[13px] text-muted">
            {product.brand} · {product.category}
            {product.mount && ` · Ngàm ${product.mount}`}
          </p>
          <h1 className="mb-2 mt-1 text-[26px] font-bold leading-tight tracking-tight md:mb-2.5 md:mt-1.5 md:text-[34px]">{product.name}</h1>
          <a href="#danh-gia" className="flex w-fit items-center gap-2 text-sm text-ink-2 hover:text-accent">
            <Stars value={reviews.average} size="text-[15px]" />
            {reviews.count > 0 ? (
              <span>
                <b className="font-semibold">{reviews.average.toLocaleString("vi-VN")}</b> · {reviews.count} đánh giá
              </span>
            ) : (
              <span>Chưa có đánh giá</span>
            )}
          </a>

          <VariantPicker variants={product.variants} />

          {product.description && (
            <div className="mt-8 border-t border-line pt-6">
              <h2 className="mb-2 text-[13px] font-semibold">Mô tả</h2>
              <p className="whitespace-pre-line leading-relaxed text-ink-2">{product.description}</p>
            </div>
          )}
        </section>
      </div>

      {product.specs.length > 0 && <SpecTable specs={product.specs} />}

      <ReviewSection productId={product.id} data={reviews} />

      {product.compatibleProducts.length > 0 && (
        <section aria-labelledby="compatible-title" className="mt-12 md:mt-20">
          <h2 id="compatible-title" className="mb-4 text-xl font-bold tracking-tight md:mb-7 md:text-[22px]">{compatibleTitle}</h2>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:gap-x-6 md:gap-y-8 md:overflow-visible md:px-0">
            {product.compatibleProducts.map((p) => (
              <div key={p.id} className="w-40 shrink-0 md:w-auto">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
