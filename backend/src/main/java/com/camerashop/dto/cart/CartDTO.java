// Whole cart: lines, total quantity and total price (always computed on the server).

package com.camerashop.dto.cart;

import java.math.BigDecimal;
import java.util.List;

public record CartDTO(
        List<CartItemDTO> items,
        int totalQuantity,
        BigDecimal totalAmount) {

    public static CartDTO empty() {
        return new CartDTO(List.of(), 0, BigDecimal.ZERO);
    }

    public static CartDTO from(List<CartItemDTO> items) {
        int totalQuantity = items.stream().mapToInt(item -> item.quantity()).sum();
        BigDecimal totalAmount = items.stream()
                .map(item -> item.lineTotal())
                .reduce(BigDecimal.ZERO, (a, b) -> a.add(b));
        return new CartDTO(items, totalQuantity, totalAmount);
    }
}
