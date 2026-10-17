// Order detail page: status, progress steps, payment, shipping info and items, with cancel / pay again actions.

import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { OrderStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { getMyOrder } from "@/lib/api";
import { formatDateTime, formatPaymentMethod, formatPrice } from "@/lib/format";
import { getSession } from "@/lib/session";

import CancelOrderButton from "./CancelOrderButton";
import PayVnpayButton from "./PayVnpayButton";

export default async function OrderDetailPage({ params, searchParams }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  const { success } = await searchParams;
  if (!(await getSession())) {
    redirect(`/login?next=/orders/${id}`);
  }
  const order = await getMyOrder(id);

  if (!order) {
    notFound();
  }

  const canCancel = order.status === "PENDING" && order.paymentStatus !== "PAID";
  const canPay = order.paymentMethod === "VNPAY" && order.paymentStatus === "UNPAID" && order.status === "PENDING";

  return (
    <main className="mx-auto flex w-full max-w-250 flex-col gap-6 px-4 pb-14 pt-6 md:px-6 md:pb-24 md:pt-8">
      <Link href="/orders" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted hover:text-accent">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="m15 6-6 6 6 6" />
        </svg>
        Đơn hàng của tôi
      </Link>

      {success === "1" && (
        <div role="status" className="flex items-center gap-3.5 rounded-xl border border-green-200 bg-green-50 px-5 py-4.5 text-green-800">
          <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 5 5 9-10" />
            </svg>
          </span>
          <span className="flex flex-col">
            <b className="text-base font-bold">Đặt hàng thành công!</b>
            <span className="text-sm">Cảm ơn bạn. Shop sẽ xác nhận đơn sớm.</span>
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-[30px]">Đơn hàng #{order.id}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <span className="text-sm text-muted">Đặt lúc {formatDateTime(order.createdAt)}</span>
        </div>
        {(canCancel || canPay) && (
          <div className="flex flex-wrap items-start gap-3">
            {canPay && <PayVnpayButton orderId={order.id} />}
            {canCancel && <CancelOrderButton orderId={order.id} />}
          </div>
        )}
      </div>

      {order.status === "CANCELLED" ? (
        <p className="rounded-xl bg-soft px-5 py-4 text-sm text-ink-2">Đơn hàng này đã bị hủy.</p>
      ) : (
        <OrderSteps status={order.status} />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="flex flex-col items-start gap-3 rounded-xl border border-line bg-surface p-6">
          <h2 className="text-[13px] font-semibold text-muted">Thanh toán</h2>
          <span className="font-semibold">{formatPaymentMethod(order.paymentMethod)}</span>
          <PaymentStatusBadge status={order.paymentStatus} />
          {order.paidAt && <span className="text-[13px] text-muted">Trả lúc {formatDateTime(order.paidAt)}</span>}
        </section>

        <section className="flex flex-col gap-1.5 rounded-xl border border-line bg-surface p-6">
          <h2 className="mb-1.5 text-[13px] font-semibold text-muted">Giao đến</h2>
          <span className="font-semibold">{order.receiverName} · {order.phone}</span>
          <span className="text-ink-2">{order.address}</span>
        </section>
      </div>

      <section aria-label="Các món" className="rounded-xl border border-line bg-surface">
        <ul className="px-5 md:px-6">
          {order.items.map((item) => (
            <li key={`${item.productId}-${item.variantName}`} className="flex items-center gap-4 border-b border-line py-5">
              <span className="flex min-w-0 flex-1 flex-col">
                <Link href={`/products/${item.productId}`} className="font-semibold hover:text-accent">{item.productName}</Link>
                <span className="price text-[13px] text-muted">
                  {item.variantName} · {formatPrice(item.unitPrice)} × {item.quantity}
                </span>
              </span>
              <span className="price shrink-0 font-bold">{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between px-5 py-5 md:px-6">
          <span className="font-semibold">Tổng cộng</span>
          <span className="price text-2xl font-bold text-accent">{formatPrice(order.totalAmount)}</span>
        </div>
      </section>
    </main>
  );
}

// Three-step progress bar (pending, shipping, completed).
function OrderSteps({ status }: { status: string }) {
  const steps = ["Chờ xác nhận", "Đang giao", "Hoàn thành"];
  const current = { PENDING: 0, SHIPPING: 1, COMPLETED: 2 }[status] ?? 0;
  return (
    <ol aria-label="Tiến trình đơn hàng" className="grid grid-cols-3 gap-3 rounded-xl border border-line bg-surface p-5 md:p-6">
      {steps.map((name, index) => {
        const done = index <= current;
        return (
          <li key={name} aria-current={index === current ? "step" : undefined} className="flex flex-col gap-2.5">
            <span aria-hidden="true" className={`block h-1 rounded-sm ${done ? "bg-ink" : "bg-line"}`} />
            <span className={`text-[13px] md:text-sm ${done ? "font-semibold" : "text-muted"}`}>{name}</span>
          </li>
        );
      })}
    </ol>
  );
}
