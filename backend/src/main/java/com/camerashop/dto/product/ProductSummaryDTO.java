package com.camerashop.dto.product;

import java.math.BigDecimal;

import com.camerashop.entity.Product;

public record ProductSummaryDTO(
        Long id,
        String name,
        String brand,
        String category,
        String mount,
        String imageUrl,
        BigDecimal minPrice,
        BigDecimal maxPrice) {

    public static ProductSummaryDTO from(Product product, BigDecimal minPrice, BigDecimal maxPrice) {
        return new ProductSummaryDTO(
                product.getId(),
                product.getName(),
                product.getBrand().getName(),
                product.getCategory().getName(),
                product.getMount() == null ? null : product.getMount().getName(),
                product.getImageUrl(),
                minPrice,
                maxPrice);
    }
}
