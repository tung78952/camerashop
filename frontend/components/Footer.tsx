// Site footer.

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-ink text-line-strong">
      <div className="mx-auto grid w-full max-w-300 gap-7 px-4 pb-6 pt-10 text-sm sm:grid-cols-3 sm:gap-10 md:px-6 md:pb-8 md:pt-14">
        <div className="flex flex-col gap-3">
          <p className="text-lg tracking-tight text-white">
            <b className="font-bold">TCamera</b>
            <span className="font-medium text-red-400">Shop</span>
          </p>
          <p className="max-w-75 leading-relaxed">
            Máy ảnh, ống kính và phụ kiện chính hãng. Gợi ý ống kính, pin, sạc dùng được với máy của bạn.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <p className="text-[13px] font-semibold text-white">Mua sắm</p>
          <Link href="/" className="hover:text-white">Tất cả sản phẩm</Link>
          <Link href="/?order=price_asc" className="hover:text-white">Giá tốt nhất</Link>
          <Link href="/cart" className="hover:text-white">Giỏ hàng</Link>
        </div>

        <div className="flex flex-col gap-2.5">
          <p className="text-[13px] font-semibold text-white">Về dự án</p>
          <p className="leading-relaxed">Dự án portfolio (Spring Boot + Next.js) — trang demo, không bán hàng thật.</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-300 border-t border-ink-2 px-4 pb-7 pt-5 text-xs text-stone-400 md:px-6 md:text-[13px]">
        © {new Date().getFullYear()} TCameraShop · Demo project
      </div>
    </footer>
  );
}
