// Variant selector with price, stock, quantity and "add to cart".

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import QuantityStepper from "@/components/QuantityStepper";
import { addToCartAction } from "@/lib/actions";
import type { Variant } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export default function VariantPicker({ variants }: { variants: Variant[] }) {
  const [selected, setSelected] = useState<Variant | undefined>(variants[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  if (!selected) {
    return <p className="mt-6 text-muted">Sản phẩm tạm ngừng kinh doanh</p>;
  }

  const inStock = selected.stock > 0;

  function chooseVariant(variant: Variant) {
    setSelected(variant);
    setQuantity(1);
    setMessage(null);
  }

  // Adds to cart; redirects to login when the session is missing.
  async function handleAddToCart() {
    if (!selected) return;
    setLoading(true);
    setMessage(null);
    const result = await addToCartAction(selected.id, quantity);
    setLoading(false);
    if (result.ok) {
      setMessage({ ok: true, text: "Đã thêm vào giỏ hàng" });
    } else if (result.needLogin) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
    } else {
      setMessage({ ok: false, text: result.error });
    }
  }

  return (
    <div>
      <p className="price mb-7 mt-6 text-[28px] font-bold tracking-tight text-accent md:text-[34px]">{formatPrice(selected.price)}</p>

      <div className="flex flex-col gap-2.5 border-t border-line pt-6">
        {variants.length > 1 && (
          <>
            <span id="variant-label" className="text-[13px] font-semibold">Phiên bản</span>
            <div role="group" aria-labelledby="variant-label" className="flex flex-wrap gap-2.5">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => chooseVariant(variant)}
                  aria-pressed={variant.id === selected.id}
                  className={`h-11 rounded-lg px-4.5 text-sm font-medium ${
                    variant.id === selected.id
                      ? "border-[1.5px] border-ink bg-ink text-white"
                      : "border border-line-strong bg-surface hover:border-ink"
                  } ${variant.stock === 0 ? "line-through opacity-60" : ""}`}
                >
                  {variant.name}
                </button>
              ))}
            </div>
          </>
        )}

        <p className="mt-1 flex flex-wrap gap-4 text-[13px]">
          <span className={inStock ? "font-medium text-green-700" : "text-muted"}>
            {inStock ? `Còn ${selected.stock} sản phẩm` : "Hết hàng"}
          </span>
          <span className="text-muted">SKU: {selected.sku}</span>
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <QuantityStepper size="lg" value={quantity} max={selected.stock} onChange={setQuantity} disabled={!inStock || loading} />
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock || loading}
          className="flex h-13 min-w-50 flex-1 items-center justify-center gap-2.5 rounded-lg bg-accent text-[15px] font-semibold text-white hover:bg-accent-hover disabled:bg-line disabled:text-stone-500"
        >
          {loading ? <Spinner /> : <CartIcon />}
          {!inStock ? "Hết hàng" : loading ? "Đang thêm…" : "Thêm vào giỏ hàng"}
        </button>
      </div>

      {message && (
        <div
          role="status"
          className={`mt-3 flex items-center gap-2.5 rounded-lg px-3.5 py-3 text-sm ${
            message.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
          {message.ok && (
            <Link href="/cart" className="ml-auto font-semibold underline underline-offset-[3px]">Xem giỏ</Link>
          )}
        </div>
      )}
    </div>
  );
}

// Cart icon on the add-to-cart button.
function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6.2" />
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
    </svg>
  );
}

// Loading spinner shown while the request is in flight.
function Spinner() {
  return <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />;
}

type Message = {
  ok: boolean;
  text: string;
};
