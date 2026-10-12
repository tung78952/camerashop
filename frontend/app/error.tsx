// Error boundary page with a retry button.

"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">Có lỗi xảy ra</h1>
      <p className="text-gray-500">Không tải được dữ liệu, có thể máy chủ đang bận. Bạn thử lại sau ít phút nhé.</p>
      <div className="flex gap-3">
        <button type="button" onClick={() => retry()}
          className="rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700">
          Thử lại
        </button>
        <Link href="/" className="rounded border px-4 py-2 hover:bg-gray-50">Về trang chủ</Link>
      </div>
    </main>
  );
}
