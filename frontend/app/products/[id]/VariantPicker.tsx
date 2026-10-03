"use client";

import { useState } from "react";

import type { Variant } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export default function VariantPicker({ variants }: { variants: Variant[] }) {
  const [selected, setSelected] = useState<Variant | undefined>(variants[0]);

  if (!selected) {
    return <p className="text-gray-500">Sản phẩm tạm ngừng kinh doanh</p>;
  }

  const inStock = selected.stock > 0;

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
                onClick={() => setSelected(variant)}
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

      <button
        type="button"
        disabled
        className="w-full rounded bg-red-600 px-6 py-3 font-semibold text-white opacity-50 md:w-auto"
      >
        {inStock ? "Thêm vào giỏ (sắp có)" : "Hết hàng"}
      </button>
    </div>
  );
}
