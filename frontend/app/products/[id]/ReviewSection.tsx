// Reviews block: rating summary, per-star bars, review list and the right call to action for the visitor.

import Link from "next/link";

import Stars from "@/components/Stars";
import { getMyReview, type ProductReviews } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

import ReviewForm from "./ReviewForm";

export default async function ReviewSection({ productId, data }: { productId: number; data: ProductReviews }) {
  const mine = await getMyReview(productId);
  const maxStarCount = Math.max(1, ...data.starCounts);

  return (
    <section id="danh-gia" className="mt-12 scroll-mt-4">
      <h2 className="mb-4 text-2xl font-bold">Đánh giá sản phẩm</h2>

      <div className="grid gap-6 rounded-lg border bg-white p-5 md:grid-cols-[260px_1fr]">
        <div className="text-center md:border-r md:pr-6">
          <p className="text-5xl font-bold">{data.count > 0 ? data.average.toLocaleString("vi-VN") : "–"}</p>
          <Stars value={data.average} size="text-2xl" />
          <p className="mt-1 text-sm text-gray-500">{data.count} đánh giá</p>

          <div className="mt-4 space-y-1">
            {data.starCounts.map((n, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <span className="w-6 text-right text-gray-600">{5 - index}★</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <span className="block h-full rounded-full bg-yellow-400" style={{ width: `${(n / maxStarCount) * 100}%` }} />
                </span>
                <span className="w-6 text-left text-gray-500">{n}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          {mine === null && (
            <div className="space-y-3">
              <p className="text-gray-700">Bạn đã mua sản phẩm này? Đăng nhập để chia sẻ cảm nhận.</p>
              <Link
                href={`/login?next=${encodeURIComponent(`/products/${productId}`)}`}
                className="inline-block rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Đăng nhập để đánh giá
              </Link>
              <p className="text-xs text-gray-500">Chỉ khách đã mua và nhận hàng mới viết được đánh giá.</p>
            </div>
          )}

          {mine !== null && !mine.canReview && (
            <p className="rounded bg-gray-50 p-4 text-sm text-gray-700">
              Bạn có thể đánh giá sau khi mua và <b>nhận hàng</b> sản phẩm này (đơn ở trạng thái <b>Hoàn thành</b>).
              Cách này giúp mọi đánh giá trên shop đều từ người dùng thật.
            </p>
          )}

          {mine !== null && mine.canReview && <ReviewForm productId={productId} initial={mine.myReview} />}
        </div>
      </div>

      {data.reviews.length === 0 ? (
        <p className="mt-6 text-center text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
      ) : (
        <ul className="mt-6 divide-y rounded-lg border bg-white">
          {data.reviews.map((review) => (
            <li key={review.id} className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{review.reviewerName}</span>
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">✓ Đã mua hàng</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                <Stars value={review.rating} />
                <span>{formatDateTime(review.createdAt)}</span>
                {review.edited && <span>(đã chỉnh sửa)</span>}
              </div>
              {review.comment && <p className="mt-2 whitespace-pre-line text-gray-800">{review.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
