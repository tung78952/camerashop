package com.camerashop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.camerashop.entity.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    void deleteByProductVariantId(Long variantId);
}
