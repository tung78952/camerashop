// Site footer.

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-neutral-900 text-neutral-300">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 sm:grid-cols-3">
        <div>
          <p className="mb-3 text-xl font-extrabold text-white">
            <span className="text-red-500">Camera</span>Shop
          </p>
          <p className="text-sm leading-relaxed">
            Máy ảnh, ống kính và phụ kiện chính hãng. Gợi ý ống kính, pin, sạc dùng được với máy của bạn.
          </p>
        </div>

        <div>
          <p className="mb-3 font-semibold uppercase text-white">Mua sắm</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white">Tất cả sản phẩm</Link></li>
            <li><Link href="/?order=price_asc" className="hover:text-white">Giá tốt nhất</Link></li>
            <li><Link href="/cart" className="hover:text-white">Giỏ hàng</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-semibold uppercase text-white">Về dự án</p>
          <p className="text-sm leading-relaxed">
            Dự án portfolio (Spring Boot + Next.js) — trang demo, không bán hàng thật.
          </p>
        </div>
      </div>

      <div className="border-t border-neutral-800 py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} CameraShop · Demo project
      </div>
    </footer>
  );
}
