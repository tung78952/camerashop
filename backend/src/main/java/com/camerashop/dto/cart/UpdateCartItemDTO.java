package com.camerashop.dto.cart;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateCartItemDTO(
        @NotNull(message = "Thiếu số lượng")
        @Min(value = 1, message = "Số lượng phải từ 1 trở lên")
        @Max(value = 99, message = "Số lượng tối đa 99")
        Integer quantity) {
}
