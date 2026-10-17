// Review form with a hover star picker and comment box (create or update).

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import type { Review } from "@/lib/api";
import { saveReviewAction } from "@/lib/actions";

const STAR_LABELS = ["", "Rất tệ", "Chưa tốt", "Bình thường", "Tốt", "Tuyệt vời"];
const MAX_COMMENT = 1000;

export default function ReviewForm({ productId, initial }: { productId: number; initial: Review | null }) {
  const [rating, setRating] = useState<number>(initial?.rating ?? 0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState<string>(initial?.comment ?? "");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  const shown = hover || rating;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating === 0) {
      setMessage({ ok: false, text: "Vui lòng chọn số sao" });
      return;
    }
    setSaving(true);
    setMessage(null);
    const result = await saveReviewAction(productId, rating, comment);
    setSaving(false);
    if (result.ok) {
      setMessage({ ok: true, text: initial ? "Đã cập nhật đánh giá" : "Cảm ơn bạn đã đánh giá!" });
    } else if (result.needLogin) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
    } else {
      setMessage({ ok: false, text: result.error });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[15px] font-semibold">{initial ? "Đánh giá của bạn" : "Viết đánh giá của bạn"}</span>
        <div className="flex items-center gap-2" onMouseLeave={() => setHover(0)}>
          <span className="text-sm text-muted">{STAR_LABELS[shown]}</span>
          <div role="radiogroup" aria-label="Số sao" className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={star === rating}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                aria-label={`${star} sao`}
                className={`size-10 text-[26px] leading-none transition-colors ${star <= shown ? "text-star" : "text-line-strong"}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={MAX_COMMENT}
          rows={3}
          aria-label="Nhận xét"
          placeholder="Bạn thấy sản phẩm thế nào? Ảnh, pin, lấy nét... (không bắt buộc)"
          className="w-full resize-y rounded-lg border border-line-strong bg-surface px-3.5 py-3 text-sm outline-none focus:border-ink"
        />
        <p className="text-right text-xs text-muted">{comment.length}/{MAX_COMMENT}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-lg bg-ink px-5.5 text-sm font-semibold text-white hover:bg-ink-2 disabled:opacity-60"
        >
          {saving ? "Đang gửi…" : initial ? "Cập nhật đánh giá" : "Gửi đánh giá"}
        </button>
        {message && (
          <span role="status" className={`text-sm ${message.ok ? "text-green-700" : "text-red-700"}`}>{message.text}</span>
        )}
      </div>
    </form>
  );
}
