// Site header: logo, search box, account links and cart count; compact icon layout on phones.

import Link from "next/link";

import CategoryNav from "@/components/CategoryNav";
import LogoutButton from "@/components/LogoutButton";
import type { Option } from "@/lib/api";
import type { Session } from "@/lib/session";

export default function Header({
  categories,
  cartCount,
  session,
}: {
  categories: Option[];
  cartCount: number;
  session: Session | null;
}) {
  const cartLabel = cartCount > 0 ? `Giỏ hàng, ${cartCount} món` : "Giỏ hàng";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex h-15 w-full max-w-300 items-center gap-1 pl-4 pr-2 md:h-18 md:gap-8 md:px-6">
        <Link href="/" aria-label="TCameraShop – Trang chủ" className="mr-auto flex shrink-0 items-center gap-2.5 md:mr-0">
          <LogoMark />
          <span className="text-lg tracking-tight md:text-xl">
            <b className="font-bold">TCamera</b>
            <span className="font-medium text-accent">Shop</span>
          </span>
        </Link>

        <div className="hidden max-w-140 flex-1 md:block">
          <SearchForm />
        </div>

        <nav aria-label="Tài khoản" className="ml-auto hidden items-center gap-1 text-sm font-medium md:flex">
          {session ? (
            <>
              <span className="px-3 text-muted">
                Chào, <b className="font-semibold text-ink">{session.name}</b>
              </span>
              {session.role === "ADMIN" && (
                <Link href="/admin/orders" className="flex h-11 items-center px-3 text-accent hover:text-accent-hover">Quản trị</Link>
              )}
              <Link href="/orders" className="flex h-11 items-center px-3 hover:text-accent">Đơn hàng</Link>
            </>
          ) : (
            <Link href="/login" className="flex h-11 items-center gap-2 px-3 hover:text-accent">
              <UserIcon size={20} />
              Đăng nhập
            </Link>
          )}
          <Link href="/cart" aria-label={cartLabel} className="flex h-11 items-center gap-2 px-3 hover:text-accent">
            <CartIcon size={20} />
            Giỏ hàng
            {cartCount > 0 && <CountBadge count={cartCount} />}
          </Link>
          {session && <LogoutButton />}
        </nav>

        <div className="flex items-center md:hidden">
          {session?.role === "ADMIN" && (
            <Link href="/admin/orders" aria-label="Quản trị" className="flex size-11 items-center justify-center text-accent">
              <ShieldIcon />
            </Link>
          )}
          <Link
            href={session ? "/orders" : "/login"}
            aria-label={session ? "Tài khoản và đơn hàng" : "Đăng nhập"}
            className="flex size-11 items-center justify-center"
          >
            <UserIcon size={22} />
          </Link>
          <Link href="/cart" aria-label={cartLabel} className="relative flex size-11 items-center justify-center">
            <CartIcon size={22} />
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-1">
                <CountBadge count={cartCount} small />
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <SearchForm />
      </div>

      <CategoryNav categories={categories} />
    </header>
  );
}

// Search box: a plain GET form to /?q=...
function SearchForm() {
  return (
    <form
      role="search"
      action="/"
      method="get"
      className="flex h-11 items-center rounded-full border border-line bg-soft pl-4 pr-1 focus-within:border-ink md:pl-4.5 md:pr-1.5"
    >
      <input
        type="search"
        name="q"
        aria-label="Tìm kiếm"
        placeholder="Tìm máy ảnh, ống kính, phụ kiện…"
        className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted md:text-sm"
      />
      <button
        type="submit"
        aria-label="Tìm kiếm"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-white hover:bg-ink-2 md:size-8.5"
      >
        <SearchIcon />
      </button>
    </form>
  );
}

// Cart item count pill.
function CountBadge({ count, small = false }: { count: number; small?: boolean }) {
  return (
    <span
      className={`flex items-center justify-center rounded-full bg-accent font-semibold text-white ${
        small ? "h-4.5 min-w-4.5 px-1.25 text-[11px]" : "h-5 min-w-5 px-1.5 text-xs"
      }`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

// Logo drawn as inline SVG.
function LogoMark() {
  return (
    <svg viewBox="0 0 34 34" aria-hidden="true" className="size-7.5 md:size-8.5">
      <rect width="34" height="34" rx="9" fill="var(--accent)" />
      <circle cx="17" cy="18" r="8" fill="none" stroke="#fff" strokeWidth="2.6" />
      <circle cx="17" cy="18" r="2.6" fill="#fff" />
      <circle cx="26" cy="9" r="1.8" fill="#fff" />
    </svg>
  );
}

// Inline SVG icons (no icon library needed).
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function UserIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}

function CartIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6.2" />
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6z" />
    </svg>
  );
}
