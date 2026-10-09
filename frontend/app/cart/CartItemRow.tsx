"use client";

import Link from "next/link";
import { useState } from "react";

import ProductImage from "@/components/ProductImage";
import QuantityStepper from "@/components/QuantityStepper";
import { removeCartItemAction, updateCartItemAction, type ActionResult } from "@/lib/actions";
import type { CartItem } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export default function CartItemRow({ item }: { item: CartItem }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<ActionResult>) {
    setLoading(true);
    setError(null);
    const result = await action();
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-4 p-4">
      <div className="relative size-16 shrink-0 overflow-hidden rounded border bg-white">
        <ProductImage src={item.imageUrl} name={item.productName} sizes="64px" />
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
        onChange={(newQuantity) => run(() => updateCartItemAction(item.id, newQuantity))}
      />

      <p className="w-32 text-right font-semibold text-red-600">{formatPrice(item.lineTotal)}</p>

      <button
        type="button"
        onClick={() => run(() => removeCartItemAction(item.id))}
        disabled={loading}
        className="text-sm text-gray-400 hover:text-red-600 disabled:opacity-40"
      >
        Xóa
      </button>

      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </li>
  );
}
