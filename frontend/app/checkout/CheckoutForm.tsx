// Checkout form covering the whole page: shipping info, payment method (COD or VNPay redirect) and the order summary with the submit button.

"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { placeOrderAction } from "@/lib/actions";
import type { PaymentMethod } from "@/lib/api";

export default function CheckoutForm({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
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
      paymentMethod,
    });
    if (result.ok && result.data.paymentUrl) {
      window.location.href = result.data.paymentUrl;
    } else if (result.ok) {
      router.push(`/orders/${result.data.orderId}?success=1`);
    } else if (result.needLogin) {
      router.push("/login?next=/checkout");
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[1fr_380px] lg:gap-12">
      <div className="flex min-w-0 flex-col gap-6">
        <section className="flex flex-col gap-4.5 rounded-xl border border-line bg-surface p-5 md:p-7">
          <StepTitle step={1}>Thông tin giao hàng</StepTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Họ tên người nhận" name="receiverName" placeholder="Nguyễn Văn A" maxLength={100} autoComplete="name" />
            <Field label="Số điện thoại" name="phone" placeholder="0901234567" type="tel" maxLength={15} autoComplete="tel" />
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Địa chỉ giao hàng</span>
            <textarea
              name="address"
              rows={2}
              required
              maxLength={255}
              autoComplete="street-address"
              placeholder="Số nhà, đường, phường, quận, tỉnh/thành"
              className="resize-y rounded-lg border border-line-strong bg-surface px-3.5 py-3 text-[15px] outline-none focus:border-ink"
            />
          </label>
        </section>

        <section className="flex flex-col gap-4.5 rounded-xl border border-line bg-surface p-5 md:p-7">
          <StepTitle step={2}>Phương thức thanh toán</StepTitle>
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">Phương thức thanh toán</legend>
            <PaymentOption
              value="COD" selected={paymentMethod} onSelect={setPaymentMethod}
              title="Thanh toán khi nhận hàng" description="Trả tiền mặt cho shipper khi nhận máy"
            />
            <PaymentOption
              value="VNPAY" selected={paymentMethod} onSelect={setPaymentMethod}
              title="VNPay" description="QR ngân hàng, thẻ ATM nội địa, Visa / Mastercard"
            />
          </fieldset>
          {paymentMethod === "VNPAY" && (
            <p className="text-[13px] text-ink-2">Sau khi bấm Đặt hàng, bạn sẽ được chuyển sang trang VNPay để trả tiền.</p>
          )}
        </section>
      </div>

      <aside aria-label="Đơn hàng của bạn" className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-6">
        <h2 className="text-[17px] font-bold">Đơn hàng của bạn</h2>
        {children}
        <button
          type="submit"
          disabled={loading}
          className="flex h-13 items-center justify-center rounded-lg bg-accent text-[15px] font-semibold text-white hover:bg-accent-hover disabled:opacity-70"
        >
          {loading ? "Đang đặt hàng…" : paymentMethod === "VNPAY" ? "Đặt hàng & thanh toán VNPay" : "Đặt hàng"}
        </button>
        {error && <p role="alert" className="text-[13px] text-red-700">{error}</p>}
      </aside>
    </form>
  );
}

// Section title with a step number.
function StepTitle({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 text-[17px] font-bold">
      <span aria-hidden="true" className="flex size-6.5 items-center justify-center rounded-full bg-ink text-[13px] text-white">{step}</span>
      {children}
    </h2>
  );
}

// One selectable payment method (hidden radio inside a card).
function PaymentOption({
  value,
  selected,
  onSelect,
  title,
  description,
}: {
  value: PaymentMethod;
  selected: PaymentMethod;
  onSelect: (value: PaymentMethod) => void;
  title: string;
  description: string;
}) {
  const active = value === selected;
  return (
    <label
      className={`flex min-h-19 cursor-pointer items-start gap-3.5 rounded-[10px] p-4.5 has-focus-visible:outline-2 has-focus-visible:outline-accent ${
        active ? "border-2 border-ink bg-bg" : "border border-line-strong bg-surface hover:border-ink"
      }`}
    >
      <input type="radio" name="paymentMethod" value={value} checked={active} onChange={() => onSelect(value)} className="sr-only" />
      <span aria-hidden="true" className={`mt-0.5 size-5 shrink-0 rounded-full ${active ? "border-[6px] border-accent" : "border-2 border-stone-400"}`} />
      <span className="flex flex-col gap-0.5">
        <span className="font-semibold">{title}</span>
        <span className="text-[13px] text-muted">{description}</span>
      </span>
    </label>
  );
}

// One labelled input.
function Field({
  label,
  name,
  placeholder,
  type = "text",
  maxLength,
  autoComplete,
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  maxLength: number;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        required
        className="h-12 rounded-lg border border-line-strong bg-surface px-3.5 text-[15px] outline-none focus:border-ink"
      />
    </label>
  );
}
