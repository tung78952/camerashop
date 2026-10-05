"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import QuantityStepper from "@/components/QuantityStepper";
import { ApiError, removeCartItem, updateCartItem, type CartItem } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export default function CartItemRow({ item }: { item: CartItem }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function run(action: () => Promise<unknown>) {
    setLoading(true);
    setError(null);
    try {
      await action();
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không kết nối được máy chủ, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-4 p-4">
      <div className="flex size-16 shrink-0 items-center justify-center rounded bg-gray-100 text-[10px] text-gray-400">
        Chưa có ảnh
      </div>

      <div className="min-w-48 flex-1">
        <Link href={`/products/${item.productId}`} className="font-semibold hover:text-red-600">
          {item.productName}
        </Link>
        <p className="text-sm text-gray-500">{item.variantName}</p>
        <p className="text-sm">{formatPrice(item.unitPrice)}</p>
      </div>

      <QuantityStepper
        value={item.quantity}
        max={item.stock}
        disabled={loading}
        onChange={(newQuantity) => run(() => updateCartItem(item.id, newQuantity))}
      />

      <p className="w-32 text-right font-semibold text-red-600">{formatPrice(item.lineTotal)}</p>

      <button
        type="button"
        onClick={() => run(() => removeCartItem(item.id))}
        disabled={loading}
        className="text-sm text-gray-400 hover:text-red-600 disabled:opacity-40"
      >
        Xóa
      </button>

      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </li>
  );
}
