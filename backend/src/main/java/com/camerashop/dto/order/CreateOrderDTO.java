// Checkout request: shipping info and payment method only; items and prices come from the server-side cart.

package com.camerashop.dto.order;

import com.camerashop.entity.PaymentMethod;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateOrderDTO(
        @NotBlank(message = "Vui lòng nhập tên người nhận")
        @Size(max = 100, message = "Tên người nhận tối đa 100 ký tự")
        String receiverName,

        @NotBlank(message = "Vui lòng nhập số điện thoại")
        @Pattern(regexp = "^(0|\\+84)\\d{9,10}$", message = "Số điện thoại không hợp lệ")
        String phone,

        @NotBlank(message = "Vui lòng nhập địa chỉ giao hàng")
        @Size(max = 255, message = "Địa chỉ tối đa 255 ký tự")
        String address,

        PaymentMethod paymentMethod) {
}
