// Buttons for the next allowed status of an order.

"use client";

import { useState } from "react";

import { changeOrderStatusAction } from "@/lib/actions";
import type { OrderStatus } from "@/lib/api";

const NEXT_ACTIONS: Record<OrderStatus, { to: OrderStatus; label: string; danger?: boolean }[]> = {
  PENDING: [
    { to: "SHIPPING", label: "Chuyển sang Đang giao" },
    { to: "CANCELLED", label: "Hủy", danger: true },
  ],
  SHIPPING: [{ to: "COMPLETED", label: "Chuyển sang Hoàn thành" }],
  COMPLETED: [],
  CANCELLED: [],
};

export default function StatusActions({ orderId, status }: { orderId: number; status: OrderStatus }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function changeTo(next: OrderStatus) {
    setLoading(true);
    setError(null);
    const result = await changeOrderStatusAction(orderId, next);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
    }
  }

  const actions = NEXT_ACTIONS[status];
  if (actions.length === 0) {
    return <span className="block text-[13px] text-stone-400 md:text-right">—</span>;
  }

  return (
    <div className="flex flex-col gap-1 md:items-end">
      <div className="flex flex-wrap gap-2 md:justify-end">
        {actions.map((action) => (
          <button
            key={action.to}
            type="button"
            onClick={() => changeTo(action.to)}
            disabled={loading}
            className={`inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-lg border bg-surface px-3.5 text-[13px] font-semibold disabled:opacity-60 ${
              action.danger ? "border-red-300 text-red-700 hover:bg-red-50" : "border-line-strong hover:border-ink"
            }`}
          >
            {action.label}
            {!action.danger && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="m9 6 6 6-6 6" />
              </svg>
            )}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
