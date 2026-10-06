package com.camerashop.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.camerashop.entity.Order;
import com.camerashop.entity.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"items", "items.productVariant", "items.productVariant.product"})
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"items", "items.productVariant", "items.productVariant.product"})
    Optional<Order> findByIdAndUserId(Long id, Long userId);

    @EntityGraph(attributePaths = {"items", "items.productVariant", "items.productVariant.product"})
    Optional<Order> findWithItemsById(Long id);

    @EntityGraph(attributePaths = {"items", "items.productVariant", "items.productVariant.product"})
    List<Order> findAllByOrderByCreatedAtDesc();

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Order o SET o.status = :to WHERE o.id = :orderId AND o.status = :from")
    int updateStatus(Long orderId, OrderStatus from, OrderStatus to);
}
