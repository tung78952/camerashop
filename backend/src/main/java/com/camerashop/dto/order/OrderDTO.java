package com.camerashop.dto.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.camerashop.entity.Order;
import com.camerashop.entity.OrderStatus;
import com.camerashop.entity.PaymentMethod;
import com.camerashop.entity.PaymentStatus;

public record OrderDTO(
        Long id,
        OrderStatus status,
        BigDecimal totalAmount,
        String receiverName,
        String phone,
        String address,
        Instant createdAt,
        PaymentMethod paymentMethod,
        PaymentStatus paymentStatus,
        Instant paidAt,
        List<OrderItemDTO> items) {

    public static OrderDTO from(Order order) {
        List<OrderItemDTO> items = order.getItems().stream()
                .map(item -> OrderItemDTO.from(item))
                .toList();
        return new OrderDTO(
                order.getId(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getReceiverName(),
                order.getPhone(),
                order.getAddress(),
                order.getCreatedAt(),
                order.getPaymentMethod(),
                order.getPaymentStatus(),
                order.getPaidAt(),
                items);
    }
}
