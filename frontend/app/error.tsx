// Error boundary page with a retry button.

"use client";

import { useEffect } from "react";

import StatusPage from "@/components/StatusPage";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      code="500"
      title="Có lỗi xảy ra"
      message="Không tải được dữ liệu, có thể máy chủ đang bận. Bạn thử lại sau ít phút nhé."
      action={
        <button type="button" onClick={() => retry()}
          className="h-12 rounded-lg bg-ink px-6 font-semibold text-white hover:bg-ink-2">
          Thử lại
        </button>
      }
    />
  );
}
