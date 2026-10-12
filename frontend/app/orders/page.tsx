// "My orders" page.

import Link from "next/link";
import { redirect } from "next/navigation";

import { getMyOrders } from "@/lib/api";
import { formatDateTime, formatOrderStatus, formatPrice, orderStatusColor } from "@/lib/format";
import { getSession } from "@/lib/session";

export default async function MyOrdersPage() {
  if (!(await getSession())) {
    redirect("/login?next=/orders");
  }
  const orders = await getMyOrders();

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Đơn hàng của tôi</h1>

      {orders.length === 0 && (
        <p className="rounded-lg border bg-white p-8 text-center text-gray-500">
          Bạn chưa có đơn hàng nào. <Link href="/" className="text-red-600 underline">Mua sắm ngay</Link>
        </p>
      )}

      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/orders/${order.id}`}
              className="block rounded-lg border bg-white p-4 transition hover:border-red-500 hover:shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">Đơn #{order.id}</span>
                <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${orderStatusColor(order.status)}`}>
                  {formatOrderStatus(order.status)}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {formatDateTime(order.createdAt)} · {order.items.length} món
              </p>
              <p className="mt-1 font-semibold text-red-600">{formatPrice(order.totalAmount)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
