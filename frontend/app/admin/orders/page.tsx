// Admin orders: a table on desktop, cards on phones, with status actions.

import { OrderStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { getAllOrdersAdmin } from "@/lib/api";
import { formatDateTime, formatPrice } from "@/lib/format";

import { Forbidden, requireAdmin } from "../guard";
import StatusActions from "./StatusActions";

export default async function AdminOrdersPage() {
  if (!(await requireAdmin("/admin/orders"))) {
    return <Forbidden />;
  }

  const orders = await getAllOrdersAdmin();

  return (
    <main className="mx-auto w-full max-w-300 px-4 pb-14 pt-6 md:px-6 md:pb-24">
      <p className="mb-4 text-sm text-muted">{orders.length} đơn · mới nhất ở trên</p>

      {orders.length === 0 ? (
        <p className="rounded-xl border border-line bg-surface p-10 text-center text-muted">Chưa có đơn hàng nào.</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-line bg-surface md:block">
            <table className="w-full min-w-245 text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th scope="col" className="py-3 pl-6 pr-4 font-semibold">Đơn</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Ngày đặt</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Người nhận</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Tổng tiền</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Thanh toán</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Trạng thái</th>
                  <th scope="col" className="py-3 pl-4 pr-6 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-line align-middle hover:bg-bg">
                    <td className="py-4 pl-6 pr-4 font-bold">#{order.id}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-ink-2">{formatDateTime(order.createdAt)}</td>
                    <td className="px-4 py-4">
                      <span className="flex flex-col">
                        <span className="font-medium">{order.receiverName}</span>
                        <span className="text-xs text-muted">{order.phone}</span>
                      </span>
                    </td>
                    <td className="price whitespace-nowrap px-4 py-4 text-right font-semibold">{formatPrice(order.totalAmount)}</td>
                    <td className="px-4 py-4">
                      <span className="flex flex-col items-start gap-1">
                        <PaymentStatusBadge status={order.paymentStatus} />
                        <span className="text-xs text-muted">{order.paymentMethod === "VNPAY" ? "VNPay" : "COD"}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4"><OrderStatusBadge status={order.status} /></td>
                    <td className="py-4 pl-4 pr-6">
                      <StatusActions orderId={order.id} status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 md:hidden">
            {orders.map((order) => (
              <li key={order.id} className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <b className="font-bold">Đơn #{order.id}</b>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex flex-col text-sm">
                  <span className="font-medium">{order.receiverName} · {order.phone}</span>
                  <span className="text-[13px] text-muted">
                    {formatDateTime(order.createdAt)} · {order.paymentMethod === "VNPAY" ? "VNPay" : "COD"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <PaymentStatusBadge status={order.paymentStatus} />
                  <span className="price font-bold">{formatPrice(order.totalAmount)}</span>
                </div>
                <StatusActions orderId={order.id} status={order.status} />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
