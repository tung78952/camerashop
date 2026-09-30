package com.camerashop.dto;

import com.camerashop.entity.Product;

public record ProductSummaryResponse(
        Long id,
        String name,
        String brand,
        String category,
        String mount,
        String imageUrl) {

    public static ProductSummaryResponse from(Product product) {
        return new ProductSummaryResponse(
                product.getId(),
                product.getName(),
                product.getBrand().getName(),
                product.getCategory().getName(),
                product.getMount() == null ? null : product.getMount().getName(),
                product.getImageUrl());
    }
}
