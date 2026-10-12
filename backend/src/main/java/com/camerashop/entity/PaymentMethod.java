// How the customer pays: cash on delivery or VNPay online payment.

package com.camerashop.entity;

public enum PaymentMethod {
    COD("Thanh toán khi nhận hàng"),
    VNPAY("Thanh toán online qua VNPay");

    private final String label;

    PaymentMethod(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
