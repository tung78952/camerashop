import Link from "next/link";
import { notFound } from "next/navigation";

import { getMyOrder } from "@/lib/api";
import { formatDateTime, formatOrderStatus, formatPrice } from "@/lib/format";

export default async function OrderDetailPage({ params, searchParams }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  const { success } = await searchParams;
  const order = await getMyOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      {success === "1" && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
          <p className="text-lg font-semibold">🎉 Đặt hàng thành công!</p>
          <p className="text-sm">Cảm ơn bạn. Shop sẽ gọi xác nhận trong thời gian sớm nhất.</p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Đơn hàng #{order.id}</h1>
        <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
          {formatOrderStatus(order.status)}
        </span>
      </div>
      <p className="mb-6 text-sm text-gray-500">Đặt lúc {formatDateTime(order.createdAt)}</p>

      <section className="mb-6 rounded-lg border bg-white p-5 text-sm">
        <h2 className="mb-2 font-semibold">Giao đến</h2>
        <p>{order.receiverName} · {order.phone}</p>
        <p className="text-gray-600">{order.address}</p>
      </section>

      <section className="rounded-lg border bg-white p-5">
        <ul className="divide-y text-sm">
          {order.items.map((item) => (
            <li key={`${item.productId}-${item.variantName}`} className="flex justify-between gap-3 py-2">
              <span>
                <Link href={`/products/${item.productId}`} className="hover:text-red-600">{item.productName}</Link>{" "}
                <span className="text-gray-500">({item.variantName})</span> × {item.quantity}
              </span>
              <span className="shrink-0">{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t pt-4">
          <span className="font-semibold">Tổng cộng</span>
          <span className="text-xl font-bold text-red-600">{formatPrice(order.totalAmount)}</span>
        </div>
      </section>

      <div className="mt-6 flex gap-4 text-sm">
        <Link href="/orders" className="text-gray-600 hover:text-red-600">← Đơn hàng của tôi</Link>
        <Link href="/" className="text-gray-600 hover:text-red-600">Tiếp tục mua sắm</Link>
      </div>
    </main>
  );
}
