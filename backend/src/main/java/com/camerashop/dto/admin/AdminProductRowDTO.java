package com.camerashop.dto.admin;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

import com.camerashop.entity.Product;
import com.camerashop.entity.ProductVariant;

public record AdminProductRowDTO(
        Long id,
        String name,
        String brand,
        String category,
        String imageUrl,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        int totalStock,
        int variantCount,
        boolean active) {

    public static AdminProductRowDTO from(Product product, List<ProductVariant> variants) {
        BigDecimal min = variants.stream().map(v -> v.getPrice()).min(Comparator.naturalOrder()).orElse(null);
        BigDecimal max = variants.stream().map(v -> v.getPrice()).max(Comparator.naturalOrder()).orElse(null);
        int stock = variants.stream().mapToInt(v -> v.getStock()).sum();
        return new AdminProductRowDTO(product.getId(), product.getName(), product.getBrand().getName(),
                product.getCategory().getName(), product.getImageUrl(), min, max, stock, variants.size(),
                product.isActive());
    }
}
