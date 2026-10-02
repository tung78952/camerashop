package com.camerashop.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.camerashop.dto.common.PageDTO;
import com.camerashop.dto.product.ProductDetailDTO;
import com.camerashop.dto.product.ProductSummaryDTO;
import com.camerashop.dto.product.VariantDTO;
import com.camerashop.entity.Product;
import com.camerashop.exception.NotFoundException;
import com.camerashop.repository.ProductRepository;
import com.camerashop.repository.ProductSpecification;
import com.camerashop.repository.ProductVariantRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final String CAMERA = "Máy ảnh";
    private static final String LENS = "Ống kính";
    private static final String BATTERY_AND_CHARGER = "Pin & sạc";

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    public PageDTO<ProductSummaryDTO> getAll(Long brandId, Long categoryId, Long mountId,
                                             BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        Specification<Product> spec = ProductSpecification.hasBrand(brandId)
                .and(ProductSpecification.hasCategory(categoryId))
                .and(ProductSpecification.hasMount(mountId))
                .and(ProductSpecification.priceBetween(minPrice, maxPrice));

        Page<ProductSummaryDTO> page = productRepository.findAll(spec, pageable)
                .map(product -> ProductSummaryDTO.from(product));
        return PageDTO.from(page);
    }

    public ProductDetailDTO getDetail(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm " + id));

        List<VariantDTO> variants = productVariantRepository.findByProductIdOrderByPriceAsc(id).stream()
                .map(variant -> VariantDTO.from(variant))
                .toList();

        List<ProductSummaryDTO> compatible = findCompatibleProducts(product).stream()
                .map(p -> ProductSummaryDTO.from(p))
                .toList();

        return ProductDetailDTO.from(product, variants, compatible);
    }

    private List<Product> findCompatibleProducts(Product product) {
        String category = product.getCategory().getName();

        if (category.equals(BATTERY_AND_CHARGER)) {
            return productRepository.findCamerasForAccessory(product.getId());
        }

        if (category.equals(LENS)) {
            return productRepository.findByMountIdAndCategoryName(product.getMount().getId(), CAMERA);
        }

        if (category.equals(CAMERA)) {
            List<Product> result = new ArrayList<>();
            if (product.getMount() != null) {
                result.addAll(productRepository.findByMountIdAndCategoryName(product.getMount().getId(), LENS));
            }
            result.addAll(productRepository.findByCompatibleCamerasId(product.getId()));
            return result;
        }

        return new ArrayList<>();
    }
}
