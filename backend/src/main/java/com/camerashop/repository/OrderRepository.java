// Order queries, including race-safe status updates.

package com.camerashop.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.camerashop.entity.Order;
import com.camerashop.entity.OrderStatus;
import com.camerashop.entity.PaymentStatus;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // The user's orders, newest first, with items loaded (no N+1).
    @EntityGraph(attributePaths = {"items", "items.productVariant", "items.productVariant.product"})
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    // One order, but only if it belongs to the given user.
    @EntityGraph(attributePaths = {"items", "items.productVariant", "items.productVariant.product"})
    Optional<Order> findByIdAndUserId(Long id, Long userId);

    // One order with its items (admin and background jobs).
    @EntityGraph(attributePaths = {"items", "items.productVariant", "items.productVariant.product"})
    Optional<Order> findWithItemsById(Long id);

    // All orders for the admin page, newest first.
    @EntityGraph(attributePaths = {"items", "items.productVariant", "items.productVariant.product"})
    List<Order> findAllByOrderByCreatedAtDesc();

    // Conditional update: changes the status only if it still equals "from"; returns 0 if someone changed it first.
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Order o SET o.status = :to WHERE o.id = :orderId AND o.status = :from")
    int updateStatus(Long orderId, OrderStatus from, OrderStatus to);

    // Conditional update so a payment result is applied exactly once, even if VNPay reports it twice.
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Order o SET o.paymentStatus = :to, o.paymentTxnNo = :txnNo, o.paidAt = :paidAt "
            + "WHERE o.id = :orderId AND o.paymentStatus = :from")
    int updatePaymentStatus(Long orderId, PaymentStatus from, PaymentStatus to, String txnNo, Instant paidAt);
}
