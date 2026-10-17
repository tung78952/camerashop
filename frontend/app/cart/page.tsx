// Cart page: cart lines and order summary.

import Link from "next/link";
import { redirect } from "next/navigation";

import EmptyState, { CartIcon } from "@/components/EmptyState";
import { getCart } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { getSession } from "@/lib/session";

import CartItemRow from "./CartItemRow";

export default async function CartPage() {
  if (!(await getSession())) {
    redirect("/login?next=/cart");
  }
  const cart = await getCart();
  const isEmpty = cart.items.length === 0;

  return (
    <main className="mx-auto w-full max-w-300 px-4 pb-14 pt-6 md:px-6 md:pb-24 md:pt-10">
      <div className="mb-6 flex items-baseline gap-3.5 md:mb-8">
        <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-[32px]">Giỏ hàng</h1>
        {!isEmpty && <span className="text-sm text-muted">{cart.totalQuantity} món</span>}
      </div>

      {isEmpty ? (
        <EmptyState icon={<CartIcon />} title="Giỏ hàng đang trống" />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px] lg:gap-12">
          <section aria-label="Sản phẩm trong giỏ" className="min-w-0 rounded-xl border border-line bg-surface">
            <div className="hidden grid-cols-[minmax(0,1fr)_110px_120px_130px_44px] gap-4 border-b border-line px-6 py-3.5 text-xs font-semibold text-muted md:grid">
              <span>Sản phẩm</span>
              <span className="text-right">Đơn giá</span>
              <span className="text-center">Số lượng</span>
              <span className="text-right">Thành tiền</span>
              <span />
            </div>
            <ul>
              {cart.items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </ul>
            <div className="px-4 py-4 md:px-6">
              <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-accent">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="m15 6-6 6 6 6" />
                </svg>
                Tiếp tục mua sắm
              </Link>
            </div>
          </section>

          <aside aria-label="Tóm tắt" className="flex flex-col gap-3.5 rounded-xl border border-line bg-surface p-6">
            <h2 className="text-base font-bold">Tóm tắt</h2>
            <div className="flex justify-between text-sm text-ink-2">
              <span>Tạm tính ({cart.totalQuantity} món)</span>
              <span className="price">{formatPrice(cart.totalAmount)}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3.5">
              <span className="font-semibold">Tổng cộng</span>
              <span className="price text-2xl font-bold text-accent">{formatPrice(cart.totalAmount)}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-1.5 flex h-13 items-center justify-center rounded-lg bg-accent text-[15px] font-semibold text-white hover:bg-accent-hover"
            >
              Thanh toán
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
