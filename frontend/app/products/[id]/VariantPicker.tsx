"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import QuantityStepper from "@/components/QuantityStepper";
import { addCartItem, ApiError, type Variant } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export default function VariantPicker({ variants }: { variants: Variant[] }) {
  const [selected, setSelected] = useState<Variant | undefined>(variants[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  if (!selected) {
    return <p className="text-gray-500">Sản phẩm tạm ngừng kinh doanh</p>;
  }

  const inStock = selected.stock > 0;

  function chooseVariant(variant: Variant) {
    setSelected(variant);
    setQuantity(1);
    setMessage(null);
  }

  async function handleAddToCart() {
    if (!selected) return;
    setLoading(true);
    setMessage(null);
    try {
      await addCartItem(selected.id, quantity);
      setMessage({ ok: true, text: "Đã thêm vào giỏ hàng" });
      router.refresh();
    } catch (error) {
      const text = error instanceof ApiError ? error.message : "Không kết nối được máy chủ, vui lòng thử lại";
      setMessage({ ok: false, text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-3xl font-bold text-red-600">{formatPrice(selected.price)}</p>

      {variants.length > 1 && (
        <div>
          <p className="mb-2 text-sm font-medium">Phiên bản</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => chooseVariant(variant)}
                className={`rounded border px-4 py-2 text-sm ${
                  variant.id === selected.id ? "border-red-600 bg-red-50 font-semibold text-red-700" : ""
                } ${variant.stock === 0 ? "text-gray-400 line-through" : ""}`}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className={`text-sm ${inStock ? "text-green-700" : "text-gray-500"}`}>
        {inStock ? `Còn ${selected.stock} sản phẩm` : "Hết hàng"}
        <span className="ml-3 text-gray-400">SKU: {selected.sku}</span>
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={quantity} max={selected.stock} onChange={setQuantity} disabled={!inStock || loading} />
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock || loading}
          className="rounded bg-red-600 px-6 py-3 font-semibold uppercase text-white hover:bg-red-700 disabled:opacity-50"
        >
          {!inStock ? "Hết hàng" : loading ? "Đang thêm..." : "Thêm vào giỏ hàng"}
        </button>
      </div>

      {message && (
        <p className={`text-sm ${message.ok ? "text-green-700" : "text-red-600"}`}>
          {message.text}
          {message.ok && (
            <Link href="/cart" className="ml-2 font-semibold underline">Xem giỏ hàng</Link>
          )}
        </p>
      )}
    </div>
  );
}

type Message = {
  ok: boolean;
  text: string;
};
