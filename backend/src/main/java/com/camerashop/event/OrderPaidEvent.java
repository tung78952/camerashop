// Published after VNPay confirms a successful payment.

package com.camerashop.event;

public record OrderPaidEvent(Long orderId) {
}
