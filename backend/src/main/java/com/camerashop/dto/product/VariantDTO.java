// A selectable variant on the product page.

package com.camerashop.dto.product;

import java.math.BigDecimal;

import com.camerashop.entity.ProductVariant;

public record VariantDTO(
        Long id,
        String name,
        String sku,
        BigDecimal price,
        Integer stock) {

    public static VariantDTO from(ProductVariant variant) {
        return new VariantDTO(
                variant.getId(),
                variant.getName(),
                variant.getSku(),
                variant.getPrice(),
                variant.getStock());
    }
}
