package com.camerashop.dto.admin;

import java.util.List;

import com.camerashop.dto.product.VariantDTO;
import com.camerashop.entity.Product;

public record AdminProductDetailDTO(
        Long id,
        String name,
        String description,
        Long brandId,
        Long categoryId,
        Long mountId,
        List<String> images,
        List<VariantDTO> variants,
        List<Long> compatibleCameraIds,
        boolean active) {

    public static AdminProductDetailDTO from(Product product, List<VariantDTO> variants) {
        return new AdminProductDetailDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getBrand().getId(),
                product.getCategory().getId(),
                product.getMount() == null ? null : product.getMount().getId(),
                List.copyOf(product.getImages()),
                variants,
                product.getCompatibleCameras().stream().map(camera -> camera.getId()).sorted().toList(),
                product.isActive());
    }
}
