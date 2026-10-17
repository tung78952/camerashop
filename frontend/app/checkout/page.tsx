// Checkout page: shipping form and order summary.

import Link from "next/link";
import { redirect } from "next/navigation";

import EmptyState, { CartIcon } from "@/components/EmptyState";
import ProductImage from "@/components/ProductImage";
import { getCart } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { getSession } from "@/lib/session";

import CheckoutForm from "./CheckoutForm";

export default async function CheckoutPage() {
  if (!(await getSession())) {
    redirect("/login?next=/checkout");
  }
  const cart = await getCart();

  return (
    <main className="mx-auto w-full max-w-300 px-4 pb-14 pt-6 md:px-6 md:pb-24 md:pt-8">
      <Link href="/cart" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="m15 6-6 6 6 6" />
        </svg>
        Giỏ hàng
      </Link>
      <h1 className="mb-6 text-2xl font-bold leading-tight tracking-tight md:mb-8 md:text-[32px]">Thanh toán</h1>

      {cart.items.length === 0 ? (
        <EmptyState icon={<CartIcon />} title="Giỏ hàng đang trống" />
      ) : (
        <CheckoutForm>
          <ul className="flex flex-col gap-3.5">
            {cart.items.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <span className="relative size-14 shrink-0 rounded-lg border border-line bg-surface">
                  <span className="absolute inset-1 overflow-hidden">
                    <ProductImage src={item.imageUrl} name={item.productName} sizes="56px" />
                  </span>
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-2 px-1.25 text-[11px] font-semibold text-white">
                    {item.quantity}
                  </span>
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-semibold leading-snug">{item.productName}</span>
                  <span className="text-xs text-muted">{item.variantName}</span>
                </span>
                <span className="price shrink-0 text-sm font-semibold">{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-baseline justify-between border-t border-line pt-4">
            <span className="font-semibold">Tổng cộng</span>
            <span className="price text-2xl font-bold text-accent">{formatPrice(cart.totalAmount)}</span>
          </div>
        </CheckoutForm>
      )}
    </main>
  );
}
