import Link from "next/link";

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
  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-6 py-3">
        <Link href="/" className="shrink-0 text-2xl font-extrabold tracking-tight">
          <span className="text-red-600">Camera</span>Shop
        </Link>

        <form action="/" method="get" className="flex flex-1 overflow-hidden rounded-full border focus-within:border-red-600">
          <input
            type="search"
            name="q"
            placeholder="Tìm máy ảnh, ống kính, phụ kiện..."
            className="w-full px-4 py-2 text-sm outline-none"
          />
          <button type="submit" aria-label="Tìm kiếm" className="bg-red-600 px-4 text-white hover:bg-red-700">
            <SearchIcon />
          </button>
        </form>

        {session ? (
          <div className="hidden shrink-0 items-center gap-4 text-sm sm:flex">
            <span className="font-medium">Xin chào, {session.name}</span>
            {session.role === "ADMIN" && (
              <Link href="/admin/orders" className="font-semibold text-red-600 hover:underline">Quản trị</Link>
            )}
            <Link href="/orders" className="font-medium hover:text-red-600">Đơn hàng</Link>
            <LogoutButton />
          </div>
        ) : (
          <Link href="/login" className="shrink-0 text-sm font-medium hover:text-red-600">
            Đăng nhập
          </Link>
        )}

        <Link href="/cart" className="flex shrink-0 items-center gap-2 text-sm font-medium hover:text-red-600">
          <span className="relative">
            <CartIcon />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </span>
          <span className="hidden sm:inline">Giỏ hàng</span>
        </Link>
      </div>

      <nav className="bg-red-600">
        <ul className="mx-auto flex w-full max-w-7xl gap-6 overflow-x-auto px-6 text-sm font-semibold uppercase text-white">
          <li>
            <Link href="/" className="block py-2.5 hover:text-red-100">Tất cả</Link>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <Link href={`/?categoryId=${category.id}`} className="block whitespace-nowrap py-2.5 hover:text-red-100">
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9.6a1 1 0 0 0 1-.8L21 7H6" />
    </svg>
  );
}
