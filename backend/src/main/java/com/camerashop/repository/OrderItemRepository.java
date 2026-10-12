// Order line data access.

package com.camerashop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.camerashop.entity.OrderItem;
import com.camerashop.entity.OrderStatus;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // True if the variant appears in any order (such variants cannot be deleted).
    boolean existsByProductVariantId(Long variantId);

    // True if the user has an order in the given status containing any variant of the product.
    boolean existsByOrderUserIdAndOrderStatusAndProductVariantProductId(Long userId, OrderStatus status, Long productId);
}
