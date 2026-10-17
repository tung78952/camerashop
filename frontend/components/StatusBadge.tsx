// Order status (solid pill) and payment status (outlined pill with a dot) badges; different shapes so they are not confused.

import { formatOrderStatus, formatPaymentStatus, orderStatusColor, paymentStatusColor, paymentStatusDot } from "@/lib/format";

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex h-6.5 items-center whitespace-nowrap rounded-full px-2.5 text-xs font-semibold ${orderStatusColor(status)}`}>
      {formatOrderStatus(status)}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex h-6.5 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-xs font-medium ${paymentStatusColor(status)}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${paymentStatusDot(status)}`} />
      {formatPaymentStatus(status)}
    </span>
  );
}
