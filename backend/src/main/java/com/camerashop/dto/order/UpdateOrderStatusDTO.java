package com.camerashop.dto.order;

import com.camerashop.entity.OrderStatus;

import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusDTO(
        @NotNull(message = "Thiếu trạng thái mới")
        OrderStatus status) {
}
