// 404 page.

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-500">Không tìm thấy sản phẩm hoặc trang bạn cần.</p>
      <Link href="/" className="rounded bg-red-600 px-4 py-2 font-semibold text-white">
        Về trang chủ
      </Link>
    </main>
  );
}
