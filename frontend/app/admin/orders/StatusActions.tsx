"use client";

import { useState } from "react";

import { changeOrderStatusAction } from "@/lib/actions";
import type { OrderStatus } from "@/lib/api";

const NEXT_ACTIONS: Record<OrderStatus, { to: OrderStatus; label: string; style: string }[]> = {
  PENDING: [
    { to: "SHIPPING", label: "Giao hàng", style: "bg-blue-600 text-white hover:bg-blue-700" },
    { to: "CANCELLED", label: "Hủy", style: "border border-gray-400 text-gray-600 hover:bg-gray-100" },
  ],
  SHIPPING: [{ to: "COMPLETED", label: "Hoàn thành", style: "bg-green-600 text-white hover:bg-green-700" }],
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
    return <span className="text-xs text-gray-400">—</span>;
  }

  return (
    <div>
      <div className="flex gap-2">
        {actions.map((action) => (
          <button
            key={action.to}
            type="button"
            onClick={() => changeTo(action.to)}
            disabled={loading}
            className={`rounded px-3 py-1 text-xs font-semibold disabled:opacity-50 ${action.style}`}
          >
            {action.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
