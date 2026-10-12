// Cart line data access.

package com.camerashop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.camerashop.entity.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    // Removes a deleted variant from every cart.
    void deleteByProductVariantId(Long variantId);
}
