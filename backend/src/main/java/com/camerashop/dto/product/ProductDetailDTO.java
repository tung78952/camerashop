package com.camerashop.dto.product;

import java.util.List;

import com.camerashop.entity.Product;

public record ProductDetailDTO(
        Long id,
        String name,
        String description,
        String imageUrl,
        List<String> images,
        String brand,
        String category,
        String mount,
        List<VariantDTO> variants,
        List<ProductSummaryDTO> compatibleProducts) {

    public static ProductDetailDTO from(Product product,
                                        List<VariantDTO> variants,
                                        List<ProductSummaryDTO> compatibleProducts) {
        return new ProductDetailDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getImageUrl(),
                List.copyOf(product.getImages()),
                product.getBrand().getName(),
                product.getCategory().getName(),
                product.getMount() == null ? null : product.getMount().getName(),
                variants,
                compatibleProducts);
    }
}
