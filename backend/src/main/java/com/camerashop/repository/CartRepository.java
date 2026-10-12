// Cart data access.

package com.camerashop.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.camerashop.entity.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {

    // The user's cart with its lines, variants and products loaded in one query.
    @EntityGraph(attributePaths = {"items", "items.productVariant", "items.productVariant.product"})
    Optional<Cart> findByUserId(Long userId);
}
