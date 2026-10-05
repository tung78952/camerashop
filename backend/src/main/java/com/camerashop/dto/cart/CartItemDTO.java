package com.camerashop.dto.cart;

import java.math.BigDecimal;

import com.camerashop.entity.CartItem;
import com.camerashop.entity.ProductVariant;

public record CartItemDTO(
        Long id,
        Long productId,
        String productName,
        String variantName,
        String imageUrl,
        BigDecimal unitPrice,
        Integer quantity,
        Integer stock,
        BigDecimal lineTotal) {

    public static CartItemDTO from(CartItem item) {
        ProductVariant variant = item.getProductVariant();
        BigDecimal lineTotal = variant.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return new CartItemDTO(
                item.getId(),
                variant.getProduct().getId(),
                variant.getProduct().getName(),
                variant.getName(),
                variant.getProduct().getImageUrl(),
                variant.getPrice(),
                item.getQuantity(),
                variant.getStock(),
                lineTotal);
    }
}
