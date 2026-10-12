// Formatting helpers: prices, dates and Vietnamese labels/colors for order and payment statuses.

const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

// 52990000 -> "52.990.000 ₫".
export function formatPrice(price: number): string {
  return vnd.format(price);
}

const vnDateTime = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

// ISO timestamp -> local Vietnamese date and time.
export function formatDateTime(iso: string): string {
  return vnDateTime.format(new Date(iso));
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export function formatOrderStatus(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SHIPPING: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-200 text-gray-600",
};

export function orderStatusColor(status: string): string {
  return ORDER_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700";
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng",
  VNPAY: "VNPay (QR / thẻ ATM / Visa)",
};

export function formatPaymentMethod(method: string): string {
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán thất bại",
};

export function formatPaymentStatus(status: string): string {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  UNPAID: "bg-orange-100 text-orange-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-gray-200 text-gray-600",
};

export function paymentStatusColor(status: string): string {
  return PAYMENT_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700";
}

// One price, or "min - max" when variants differ.
export function formatPriceRange(min: number, max: number): string {
  if (min === max) {
    return formatPrice(min);
  }
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}
