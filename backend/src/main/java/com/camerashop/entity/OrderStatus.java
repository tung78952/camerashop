// Order delivery status and its allowed transitions: PENDING -> SHIPPING -> COMPLETED, PENDING -> CANCELLED.

package com.camerashop.entity;

import java.util.Set;

public enum OrderStatus {
    PENDING("Chờ xác nhận"),
    SHIPPING("Đang giao"),
    COMPLETED("Hoàn thành"),
    CANCELLED("Đã hủy");

    private final String label;

    OrderStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    // Single source of truth for which status changes are allowed.
    public boolean canChangeTo(OrderStatus next) {
        Set<OrderStatus> allowed = switch (this) {
            case PENDING -> Set.of(SHIPPING, CANCELLED);
            case SHIPPING -> Set.of(COMPLETED);
            case COMPLETED, CANCELLED -> Set.of();
        };
        return allowed.contains(next);
    }
}
