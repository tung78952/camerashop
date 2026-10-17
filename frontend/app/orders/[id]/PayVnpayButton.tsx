// Retry VNPay payment for an unpaid order.

"use client";

import { useState } from "react";

import { payVnpayAction } from "@/lib/actions";

export default function PayVnpayButton({ orderId }: { orderId: number }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const result = await payVnpayAction(orderId);
    if (result.ok) {
      window.location.href = result.data;
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="h-11 rounded-lg bg-accent px-5.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-70"
      >
        {loading ? "Đang chuyển sang VNPay…" : "Thanh toán VNPay"}
      </button>
      {error && <p role="alert" className="mt-2 max-w-60 text-sm text-red-700">{error}</p>}
    </div>
  );
}
