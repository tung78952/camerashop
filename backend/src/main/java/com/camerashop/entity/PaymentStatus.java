// Payment state, separate from delivery status: UNPAID -> PAID, or FAILED (order cancelled and restocked).

package com.camerashop.entity;

public enum PaymentStatus {
    UNPAID("Chưa thanh toán"),
    PAID("Đã thanh toán"),
    FAILED("Thanh toán thất bại");

    private final String label;

    PaymentStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
