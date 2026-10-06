package com.camerashop.dto.order;

import java.math.BigDecimal;

import com.camerashop.entity.OrderItem;
import com.camerashop.entity.ProductVariant;

public record OrderItemDTO(
        Long productId,
        String productName,
        String variantName,
        BigDecimal unitPrice,
        Integer quantity,
        BigDecimal lineTotal) {

    public static OrderItemDTO from(OrderItem item) {
        ProductVariant variant = item.getProductVariant();
        return new OrderItemDTO(
                variant.getProduct().getId(),
                variant.getProduct().getName(),
                variant.getName(),
                item.getUnitPrice(),
                item.getQuantity(),
                item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
    }
}
