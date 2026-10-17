// "My orders" page: a table on desktop, cards on phones (plus a logout button, which the phone header lacks).

import Link from "next/link";
import { redirect } from "next/navigation";

import EmptyState, { ReceiptIcon } from "@/components/EmptyState";
import LogoutButton from "@/components/LogoutButton";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { getMyOrders } from "@/lib/api";
import { formatDateTime, formatPrice } from "@/lib/format";
import { getSession } from "@/lib/session";

export default async function MyOrdersPage() {
  if (!(await getSession())) {
    redirect("/login?next=/orders");
  }
  const orders = await getMyOrders();

  return (
    <main className="mx-auto w-full max-w-250 px-4 pb-14 pt-6 md:px-6 md:pb-24 md:pt-10">
      <div className="mb-6 flex items-center justify-between gap-4 md:mb-8">
        <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-[32px]">Đơn hàng của tôi</h1>
        <div className="-mr-3 shrink-0 md:hidden">
          <LogoutButton />
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={<ReceiptIcon />} title="Chưa có đơn hàng nào." />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-line bg-surface md:block">
            <table className="w-full min-w-180 text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th scope="col" className="px-6 py-3.5 font-semibold">Mã đơn</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Ngày đặt</th>
                  <th scope="col" className="px-4 py-3.5 text-right font-semibold">Tổng tiền</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Giao hàng</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Thanh toán</th>
                  <th scope="col" className="px-6 py-3.5"><span className="sr-only">Xem</span></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-line hover:bg-bg">
                    <td className="px-6 py-4.5">
                      <Link href={`/orders/${order.id}`} className="font-bold hover:text-accent">#{order.id}</Link>
                    </td>
                    <td className="px-4 py-4.5 text-ink-2">{formatDateTime(order.createdAt)}</td>
                    <td className="price px-4 py-4.5 text-right font-semibold">{formatPrice(order.totalAmount)}</td>
                    <td className="px-4 py-4.5"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-4 py-4.5">
                      <span className="flex flex-col items-start gap-1">
                        <PaymentStatusBadge status={order.paymentStatus} />
                        <span className="text-xs text-muted">{order.paymentMethod === "VNPAY" ? "VNPay" : "COD"}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <Link href={`/orders/${order.id}`} className="inline-flex items-center gap-1 font-medium text-ink-2 hover:text-accent">
                        Xem
                        <ChevronIcon />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 md:hidden">
            {orders.map((order) => (
              <li key={order.id}>
                <Link href={`/orders/${order.id}`} className="flex flex-col gap-2.5 rounded-xl border border-line bg-surface p-4">
                  <span className="flex items-center justify-between gap-2">
                    <b className="font-bold">Đơn #{order.id}</b>
                    <OrderStatusBadge status={order.status} />
                  </span>
                  <span className="text-[13px] text-muted">
                    {formatDateTime(order.createdAt)} · {order.items.length} món · {order.paymentMethod === "VNPAY" ? "VNPay" : "COD"}
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    <PaymentStatusBadge status={order.paymentStatus} />
                    <span className="price font-bold">{formatPrice(order.totalAmount)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

// Small arrow after "View".
function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
