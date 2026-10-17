// One cart line with quantity controls and remove button.

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

  const stepper = (
    <QuantityStepper
      value={item.quantity}
      max={item.stock}
      disabled={loading}
      onChange={(newQuantity) => run(() => updateCartItemAction(item.id, newQuantity))}
    />
  );

  return (
    <li className="border-b border-line px-4 py-4 md:px-6 md:py-5">
      <div className="flex items-start gap-3.5 md:grid md:grid-cols-[minmax(0,1fr)_110px_120px_130px_44px] md:items-center md:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3.5 md:gap-4">
          <Link
            href={`/products/${item.productId}`}
            aria-hidden="true"
            tabIndex={-1}
            className="relative size-18 shrink-0 overflow-hidden rounded-lg border border-line bg-surface md:size-20"
          >
            <span className="absolute inset-1.5">
              <ProductImage src={item.imageUrl} name={item.productName} sizes="80px" />
            </span>
          </Link>
          <div className="flex min-w-0 flex-col gap-0.5">
            <Link href={`/products/${item.productId}`} className="font-semibold leading-snug hover:text-accent">
              {item.productName}
            </Link>
            <span className="text-[13px] text-muted">{item.variantName}</span>
            <span className="price text-[13px] text-ink-2 md:hidden">{formatPrice(item.unitPrice)}</span>
          </div>
        </div>

        <span className="price hidden text-right text-sm text-ink-2 md:block">{formatPrice(item.unitPrice)}</span>
        <div className="hidden justify-center md:flex">{stepper}</div>
        <span className="price hidden text-right font-bold md:block">{formatPrice(item.lineTotal)}</span>

        <button
          type="button"
          onClick={() => run(() => removeCartItemAction(item.id))}
          disabled={loading}
          aria-label={`Xóa ${item.productName}`}
          className="-mr-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded-lg text-muted hover:text-accent disabled:opacity-40 md:m-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
          </svg>
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between md:hidden">
        {stepper}
        <span className="price font-bold">{formatPrice(item.lineTotal)}</span>
      </div>

      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </li>
  );
}
