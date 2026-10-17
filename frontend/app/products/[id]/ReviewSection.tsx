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
    <section id="danh-gia" aria-labelledby="reviews-title" className="mt-12 grid scroll-mt-28 gap-6 md:mt-20 lg:grid-cols-[220px_1fr] lg:gap-14">
      <div className="flex flex-col gap-4">
        <h2 id="reviews-title" className="text-xl font-bold tracking-tight md:text-[22px]">Đánh giá</h2>
        <div className="flex items-center gap-3.5">
          <span className="text-5xl font-bold leading-none tracking-tighter">
            {data.count > 0 ? data.average.toLocaleString("vi-VN") : "–"}
          </span>
          <div className="flex flex-col gap-1">
            <Stars value={data.average} size="text-base" />
            <span className="text-[13px] text-muted">{data.count} lượt đánh giá</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-[13px] text-muted">
          {data.starCounts.map((n, index) => (
            <div key={index} className="flex items-center gap-2.5">
              <span className="w-6">{5 - index}★</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-sm bg-line">
                <span className="block h-full rounded-sm bg-star" style={{ width: `${(n / maxStarCount) * 100}%` }} />
              </span>
              <span className="w-4 text-right">{n}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-8">
        {mine === null && (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-line bg-surface p-6">
            <p className="text-ink-2">Bạn đã mua sản phẩm này? Đăng nhập để chia sẻ cảm nhận.</p>
            <Link
              href={`/login?next=${encodeURIComponent(`/products/${productId}`)}`}
              className="flex h-11 items-center rounded-lg bg-ink px-5.5 text-sm font-semibold text-white hover:bg-ink-2"
            >
              Đăng nhập để đánh giá
            </Link>
            <p className="text-xs text-muted">Chỉ khách đã mua và nhận hàng mới viết được đánh giá.</p>
          </div>
        )}

        {mine !== null && !mine.canReview && (
          <p className="rounded-xl border border-line bg-surface p-6 text-sm leading-relaxed text-ink-2">
            Bạn có thể đánh giá sau khi mua và <b>nhận hàng</b> sản phẩm này (đơn ở trạng thái <b>Hoàn thành</b>).
            Cách này giúp mọi đánh giá trên shop đều từ người dùng thật.
          </p>
        )}

        {mine !== null && mine.canReview && <ReviewForm productId={productId} initial={mine.myReview} />}

        {data.reviews.length === 0 ? (
          <p className="text-muted">Chưa có đánh giá nào cho sản phẩm này.</p>
        ) : (
          <ul className="flex flex-col">
            {data.reviews.map((review) => (
              <li key={review.id} className="flex flex-col gap-1.5 border-t border-line py-5">
                <div className="flex flex-wrap items-center gap-2.5 text-sm">
                  <b className="font-semibold">{review.reviewerName}</b>
                  <span className="text-xs font-medium text-green-700">✓ Đã mua hàng</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted">
                  <Stars value={review.rating} size="text-[13px]" />
                  <span>{formatDateTime(review.createdAt)}</span>
                  {review.edited && <span>· (đã chỉnh sửa)</span>}
                </div>
                {review.comment && <p className="mt-1 whitespace-pre-line leading-relaxed text-ink-2">{review.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
