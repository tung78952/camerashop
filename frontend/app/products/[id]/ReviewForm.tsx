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
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="font-semibold">{initial ? "Đánh giá của bạn" : "Viết đánh giá"}</p>

      <div className="flex items-center gap-3" onMouseLeave={() => setHover(0)}>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              aria-label={`${star} sao`}
              className={`px-0.5 text-3xl leading-none transition ${star <= shown ? "text-yellow-400" : "text-gray-300"}`}
            >
              ★
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-600">{STAR_LABELS[shown]}</span>
      </div>

      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={MAX_COMMENT}
          rows={4}
          placeholder="Máy dùng thế nào? Ảnh, pin, lấy nét... (không bắt buộc)"
          className="w-full rounded border px-3 py-2 text-sm"
        />
        <p className="text-right text-xs text-gray-400">{comment.length}/{MAX_COMMENT}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {saving ? "Đang gửi..." : initial ? "Cập nhật đánh giá" : "Gửi đánh giá"}
        </button>
        {message && <span className={`text-sm ${message.ok ? "text-green-600" : "text-red-600"}`}>{message.text}</span>}
      </div>
    </form>
  );
}
