package com.camerashop.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.camerashop.entity.ProductVariant;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductIdOrderByPriceAsc(Long productId);

    Optional<ProductVariant> findBySku(String sku);

    interface PriceRangeRow {
        Long getProductId();
        BigDecimal getMinPrice();
        BigDecimal getMaxPrice();
    }

    @Query("""
            SELECT v.product.id AS productId, MIN(v.price) AS minPrice, MAX(v.price) AS maxPrice
            FROM ProductVariant v
            WHERE v.product.id IN :productIds
            GROUP BY v.product.id
            """)
    List<PriceRangeRow> findPriceRanges(List<Long> productIds);

    @Modifying
    @Query("""
            UPDATE ProductVariant v
            SET v.stock = v.stock - :quantity
            WHERE v.id = :variantId AND v.stock >= :quantity
            """)
    int decreaseStock(Long variantId, int quantity);
}
