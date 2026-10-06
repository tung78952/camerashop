import Link from "next/link";

import { getCart } from "@/lib/api";
import { formatPrice } from "@/lib/format";

import CartItemRow from "./CartItemRow";

export default async function CartPage() {
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
      <h1 className="mb-6 text-2xl font-bold">Giỏ hàng ({cart.totalQuantity} sản phẩm)</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <ul className="divide-y rounded-lg border bg-white">
          {cart.items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </ul>

        <aside className="h-fit space-y-4 rounded-lg border bg-white p-5">
          <div className="flex justify-between">
            <span className="text-gray-600">Tạm tính</span>
            <span className="text-xl font-bold text-red-600">{formatPrice(cart.totalAmount)}</span>
          </div>
          <Link
            href="/checkout"
            className="block w-full rounded bg-red-600 py-3 text-center font-semibold uppercase text-white hover:bg-red-700"
          >
            Đặt hàng
          </Link>
          <Link href="/" className="block text-center text-sm text-gray-500 hover:text-red-600">
            ← Tiếp tục mua sắm
          </Link>
        </aside>
      </div>
    </main>
  );
}
