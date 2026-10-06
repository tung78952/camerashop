import Link from "next/link";

import { getCart } from "@/lib/api";
import { formatPrice } from "@/lib/format";

import CheckoutForm from "./CheckoutForm";

export default async function CheckoutPage() {
  const cart = await getCart();

  if (cart.items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold">Giỏ hàng đang trống</h1>
        <Link href="/" className="rounded bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700">
          Tiếp tục mua sắm
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Thanh toán</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="rounded-lg border bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold">Thông tin giao hàng</h2>
          <CheckoutForm />
        </section>

        <aside className="h-fit rounded-lg border bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold">Đơn hàng của bạn ({cart.totalQuantity} sản phẩm)</h2>
          <ul className="divide-y text-sm">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 py-2">
                <span>
                  {item.productName} <span className="text-gray-500">({item.variantName})</span> × {item.quantity}
                </span>
                <span className="shrink-0 font-medium">{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t pt-4">
            <span className="font-semibold">Tổng cộng</span>
            <span className="text-xl font-bold text-red-600">{formatPrice(cart.totalAmount)}</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">Thanh toán khi nhận hàng (COD).</p>
        </aside>
      </div>
    </main>
  );
}
