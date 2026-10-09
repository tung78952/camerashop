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
        onClick={handleClick}
        disabled={loading}
        className="rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
      >
        {loading ? "Đang chuyển sang VNPay..." : "Thanh toán qua VNPay"}
      </button>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
