"use client";

import { useState } from "react";

import { cancelOrderAction } from "@/lib/actions";

export default function CancelOrderButton({ orderId }: { orderId: number }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (!window.confirm(`Bạn chắc chắn muốn hủy đơn #${orderId}?`)) {
      return;
    }
    setLoading(true);
    setError(null);
    const result = await cancelOrderAction(orderId);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleCancel}
        disabled={loading}
        className="rounded border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {loading ? "Đang hủy..." : "Hủy đơn"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
