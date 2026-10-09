"use client";

import { useState } from "react";

import { setProductActiveAction } from "@/lib/actions";

export default function ToggleActiveButton({ productId, active }: { productId: number; active: boolean }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (active && !window.confirm("Ẩn sản phẩm này? Khách sẽ không thấy và không mua được nữa.")) {
      return;
    }
    setLoading(true);
    setError(null);
    const result = await setProductActiveAction(productId, !active);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
    }
  }

  return (
    <span>
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className="rounded border px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
      >
        {loading ? "..." : active ? "Ẩn" : "Hiện lại"}
      </button>
      {error && <span className="ml-2 text-xs text-red-700">{error}</span>}
    </span>
  );
}
