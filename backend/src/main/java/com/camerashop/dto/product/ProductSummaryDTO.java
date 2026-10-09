package com.camerashop.dto.product;

import java.math.BigDecimal;

import com.camerashop.entity.Product;
import com.camerashop.repository.ReviewRepository.RatingRow;

public record ProductSummaryDTO(
        Long id,
        String name,
        String brand,
        String category,
        String mount,
        String imageUrl,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        double ratingAverage,
        long ratingCount) {

    public static ProductSummaryDTO from(Product product, BigDecimal minPrice, BigDecimal maxPrice, RatingRow rating) {
        return new ProductSummaryDTO(
                product.getId(),
                product.getName(),
                product.getBrand().getName(),
                product.getCategory().getName(),
                product.getMount() == null ? null : product.getMount().getName(),
                product.getImageUrl(),
                minPrice,
                maxPrice,
                rating == null ? 0 : Math.round(rating.getAverage() * 10) / 10.0,
                rating == null ? 0 : rating.getCount());
    }
}
