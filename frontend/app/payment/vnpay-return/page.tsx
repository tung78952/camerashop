// VNPay return page: forwards the parameters to the backend, which verifies the signature before showing the result.

import Link from "next/link";

import { ApiError, confirmVnpayReturn, type PaymentResult } from "@/lib/api";

export default async function VnpayReturnPage({ searchParams }: PageProps<"/payment/vnpay-return">) {
  const query = await searchParams;

  const vnpParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith("vnp_") && typeof value === "string") {
      vnpParams.append(key, value);
    }
  }

  let result: PaymentResult;
  if (!vnpParams.has("vnp_SecureHash")) {
    result = { orderId: null, paid: false, message: "Không có thông tin thanh toán" };
  } else {
    try {
      result = await confirmVnpayReturn(vnpParams);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Không kết nối được máy chủ, vui lòng thử lại";
      result = { orderId: null, paid: false, message };
    }
  }

  const orderHref = result.orderId ? `/orders/${result.orderId}` : "/orders";

  return (
    <main className="flex flex-1 justify-center px-4 pb-24 pt-12 md:pt-18">
      <section role="status" className="flex w-full max-w-120 flex-col items-center gap-3.5 rounded-2xl border border-line bg-surface px-6 pb-8 pt-12 text-center md:px-8">
        <span
          aria-hidden="true"
          className={`flex size-18 items-center justify-center rounded-full ${result.paid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d={result.paid ? "m5 12 5 5 9-10" : "M6 6l12 12M18 6 6 18"} />
          </svg>
        </span>
        <h1 className="mt-1.5 text-2xl font-bold leading-tight">{result.message}</h1>
        {result.paid && <p className="max-w-90 text-ink-2">TCameraShop đã gửi mail xác nhận thanh toán cho bạn.</p>}

        {result.orderId && (
          <dl className="mt-3 grid w-full grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-line pt-4 text-left text-sm">
            <dt className="text-muted">Mã đơn</dt>
            <dd className="text-right font-semibold">#{result.orderId}</dd>
          </dl>
        )}

        <div className="mt-3 flex w-full flex-col gap-2.5">
          <Link href={orderHref} className="flex h-12.5 items-center justify-center rounded-lg bg-ink font-semibold text-white hover:bg-ink-2">
            {result.orderId ? "Xem đơn hàng" : "Xem đơn hàng của tôi"}
          </Link>
          <Link href="/" className="flex h-12.5 items-center justify-center rounded-lg border border-line-strong font-medium hover:border-ink">
            Tiếp tục mua sắm
          </Link>
        </div>
      </section>
    </main>
  );
}
