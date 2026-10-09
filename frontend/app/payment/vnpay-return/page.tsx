import Link from "next/link";

import { ApiError, confirmVnpayReturn, type PaymentResult } from "@/lib/api";

export default async function VnpayReturnPage({ searchParams }: PageProps<"/payment/vnpay-return">) {
  const query = await searchParams;

  const vnpParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith("vnp_") && typeof value === "string") {
      vnpParams.append(key, value);
    }
  }

  let result: PaymentResult;
  if (!vnpParams.has("vnp_SecureHash")) {
    result = { orderId: null, paid: false, message: "Không có thông tin thanh toán" };
  } else {
    try {
      result = await confirmVnpayReturn(vnpParams);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Không kết nối được máy chủ, vui lòng thử lại";
      result = { orderId: null, paid: false, message };
    }
  }

  return (
    <main className="mx-auto w-full max-w-xl p-6 text-center">
      <div className={`rounded-lg border p-8 ${result.paid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
        <p className="text-5xl">{result.paid ? "✅" : "❌"}</p>
        <h1 className={`mt-4 text-2xl font-bold ${result.paid ? "text-green-800" : "text-red-800"}`}>
          {result.message}
        </h1>
        {result.orderId && (
          <p className="mt-2 text-sm text-gray-600">Đơn hàng #{result.orderId}</p>
        )}
        {result.paid && (
          <p className="mt-2 text-sm text-gray-600">CameraShop đã gửi mail xác nhận thanh toán cho bạn.</p>
        )}
      </div>

      <div className="mt-6 flex justify-center gap-4 text-sm">
        {result.orderId && (
          <Link href={`/orders/${result.orderId}`} className="font-medium text-red-600 hover:underline">
            Xem đơn hàng
          </Link>
        )}
        <Link href="/" className="text-gray-600 hover:text-red-600">Tiếp tục mua sắm</Link>
      </div>
    </main>
  );
}
