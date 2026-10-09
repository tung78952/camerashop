package com.camerashop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.camerashop.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    boolean existsByProductVariantId(Long variantId);
}
