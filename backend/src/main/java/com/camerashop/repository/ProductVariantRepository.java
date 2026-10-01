package com.camerashop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.camerashop.entity.ProductVariant;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductIdOrderByPriceAsc(Long productId);
}
