package com.camerashop.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.camerashop.dto.common.PageDTO;
import com.camerashop.dto.product.ProductDetailDTO;
import com.camerashop.dto.product.ProductSummaryDTO;
import com.camerashop.dto.product.VariantDTO;
import com.camerashop.entity.Product;
import com.camerashop.exception.NotFoundException;
import com.camerashop.repository.ProductRepository;
import com.camerashop.repository.ProductSpecification;
import com.camerashop.repository.ProductVariantRepository;
import com.camerashop.repository.ProductVariantRepository.PriceRangeRow;
import com.camerashop.repository.ReviewRepository;
import com.camerashop.repository.ReviewRepository.RatingRow;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final String CAMERA = "Máy ảnh";
    private static final String LENS = "Ống kính";
    private static final String BATTERY_AND_CHARGER = "Pin & sạc";

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ReviewRepository reviewRepository;

    private static final String PRICE_ASC = "price_asc";
    private static final String PRICE_DESC = "price_desc";

    public PageDTO<ProductSummaryDTO> getAll(String keyword, Long brandId, Long categoryId, Long mountId,
                                             BigDecimal minPrice, BigDecimal maxPrice,
                                             String order, Pageable pageable) {
        Specification<Product> spec = ProductSpecification.isActive()
                .and(ProductSpecification.nameContains(keyword))
                .and(ProductSpecification.hasBrand(brandId))
                .and(ProductSpecification.hasCategory(categoryId))
                .and(ProductSpecification.hasMount(mountId))
                .and(ProductSpecification.priceBetween(minPrice, maxPrice));

        if (PRICE_ASC.equals(order) || PRICE_DESC.equals(order)) {
            spec = spec.and(ProductSpecification.orderByMinPrice(PRICE_ASC.equals(order)));
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        }

        Page<Product> products = productRepository.findAll(spec, pageable);
        Map<Long, PriceRangeRow> priceRanges = findPriceRanges(products.getContent());
        Map<Long, RatingRow> ratings = findRatings(products.getContent());

        Page<ProductSummaryDTO> page = products.map(product -> toSummary(product, priceRanges, ratings));
        return PageDTO.from(page);
    }

    @Transactional(readOnly = true)
    public ProductDetailDTO getDetail(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm " + id));
        if (!product.isActive()) {
            throw new NotFoundException("Không tìm thấy sản phẩm " + id);
        }

        List<VariantDTO> variants = productVariantRepository.findByProductIdOrderByPriceAsc(id).stream()
                .map(variant -> VariantDTO.from(variant))
                .toList();

        List<Product> compatibleProducts = findCompatibleProducts(product).stream()
                .filter(p -> p.isActive())
                .toList();
        Map<Long, PriceRangeRow> priceRanges = findPriceRanges(compatibleProducts);
        Map<Long, RatingRow> ratings = findRatings(compatibleProducts);
        List<ProductSummaryDTO> compatible = compatibleProducts.stream()
                .map(p -> toSummary(p, priceRanges, ratings))
                .toList();

        return ProductDetailDTO.from(product, variants, compatible);
    }

    private Map<Long, PriceRangeRow> findPriceRanges(List<Product> products) {
        if (products.isEmpty()) {
            return Map.of();
        }
        List<Long> ids = products.stream().map(p -> p.getId()).toList();
        return productVariantRepository.findPriceRanges(ids).stream()
                .collect(Collectors.toMap(row -> row.getProductId(), row -> row));
    }

    private Map<Long, RatingRow> findRatings(List<Product> products) {
        if (products.isEmpty()) {
            return Map.of();
        }
        List<Long> ids = products.stream().map(p -> p.getId()).toList();
        return reviewRepository.findRatings(ids).stream()
                .collect(Collectors.toMap(row -> row.getProductId(), row -> row));
    }

    private ProductSummaryDTO toSummary(Product product, Map<Long, PriceRangeRow> priceRanges, Map<Long, RatingRow> ratings) {
        PriceRangeRow range = priceRanges.get(product.getId());
        BigDecimal minPrice = range == null ? null : range.getMinPrice();
        BigDecimal maxPrice = range == null ? null : range.getMaxPrice();
        return ProductSummaryDTO.from(product, minPrice, maxPrice, ratings.get(product.getId()));
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
