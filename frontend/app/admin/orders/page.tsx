import Link from "next/link";
import { redirect } from "next/navigation";

import { getAllOrdersAdmin } from "@/lib/api";
import { formatDateTime, formatOrderStatus, formatPrice, orderStatusColor } from "@/lib/format";
import { getSession } from "@/lib/session";

import StatusActions from "./StatusActions";

export default async function AdminOrdersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/admin/orders");
  }
  if (session.role !== "ADMIN") {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="text-2xl font-bold">403 – Không có quyền</h1>
        <p className="text-gray-500">Trang này chỉ dành cho quản trị viên.</p>
        <Link href="/" className="text-red-600 hover:underline">Về trang chủ</Link>
      </main>
    );
  }

  const orders = await getAllOrdersAdmin();

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Quản lý đơn hàng</h1>
      <p className="mb-6 text-sm text-gray-500">{orders.length} đơn · mới nhất ở trên</p>

      {orders.length === 0 ? (
        <p className="rounded-lg border bg-white p-8 text-center text-gray-500">Chưa có đơn hàng nào.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Đơn</th>
                <th className="px-4 py-3">Ngày đặt</th>
                <th className="px-4 py-3">Người nhận</th>
                <th className="px-4 py-3 text-right">Tổng tiền</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-semibold">#{order.id}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDateTime(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    {order.receiverName}
                    <p className="text-xs text-gray-500">{order.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatPrice(order.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${orderStatusColor(order.status)}`}>
                      {formatOrderStatus(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusActions orderId={order.id} status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link href="/" className="mt-6 inline-block text-sm text-gray-500 hover:text-red-600">← Về trang chủ</Link>
    </main>
  );
}
