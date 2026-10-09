package com.camerashop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.camerashop.entity.OrderItem;
import com.camerashop.entity.OrderStatus;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    boolean existsByProductVariantId(Long variantId);

    boolean existsByOrderUserIdAndOrderStatusAndProductVariantProductId(Long userId, OrderStatus status, Long productId);
}
