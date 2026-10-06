"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { placeOrderAction } from "@/lib/actions";

export default function CheckoutForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);
    const result = await placeOrderAction({
      receiverName: String(form.get("receiverName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      address: String(form.get("address") ?? ""),
    });
    if (result.ok) {
      router.push(`/orders/${result.data}?success=1`);
    } else if (result.needLogin) {
      router.push("/login?next=/checkout");
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Họ tên người nhận" name="receiverName" placeholder="Nguyễn Văn A" maxLength={100} />
      <Field label="Số điện thoại" name="phone" placeholder="0901234567" type="tel" maxLength={15} />
      <Field label="Địa chỉ giao hàng" name="address" placeholder="Số nhà, đường, phường, quận, tỉnh/thành" maxLength={255} />

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-red-600 py-3 font-semibold uppercase text-white hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? "Đang đặt hàng..." : "Đặt hàng"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  maxLength,
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  maxLength: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        required
        className="w-full rounded border px-3 py-2 outline-none focus:border-red-600"
      />
    </label>
  );
}
