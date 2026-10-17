// Cancel button for pending orders.

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
        className="h-11 rounded-lg border border-red-300 bg-surface px-5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
      >
        {loading ? "Đang hủy…" : "Hủy đơn"}
      </button>
      {error && <p role="alert" className="mt-2 max-w-60 text-sm text-red-700">{error}</p>}
    </div>
  );
}
