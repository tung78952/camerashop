const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export function formatPrice(price: number): string {
  return vnd.format(price);
}

const vnDateTime = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

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

export function formatPriceRange(min: number, max: number): string {
  if (min === max) {
    return formatPrice(min);
  }
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}
