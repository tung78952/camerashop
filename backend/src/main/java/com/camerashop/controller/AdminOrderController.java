// Admin order management: list all orders and change status.

package com.camerashop.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.camerashop.dto.order.OrderDTO;
import com.camerashop.dto.order.UpdateOrderStatusDTO;
import com.camerashop.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public List<OrderDTO> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PatchMapping("/{orderId}/status")
    public OrderDTO changeStatus(@PathVariable Long orderId,
                                 @Valid @RequestBody UpdateOrderStatusDTO request) {
        return orderService.changeStatusByAdmin(orderId, request.status());
    }
}
