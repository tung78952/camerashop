package com.camerashop.dto.product;

import com.camerashop.entity.Product;

public record ProductSummaryDTO(
        Long id,
        String name,
        String brand,
        String category,
        String mount,
        String imageUrl) {

    public static ProductSummaryDTO from(Product product) {
        return new ProductSummaryDTO(
                product.getId(),
                product.getName(),
                product.getBrand().getName(),
                product.getCategory().getName(),
                product.getMount() == null ? null : product.getMount().getName(),
                product.getImageUrl());
    }
}
