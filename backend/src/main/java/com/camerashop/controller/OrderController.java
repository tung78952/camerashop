package com.camerashop.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.camerashop.dto.order.CreateOrderDTO;
import com.camerashop.dto.order.OrderDTO;
import com.camerashop.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private static final String USER_HEADER = "X-User-Id";

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderDTO placeOrder(@RequestHeader(USER_HEADER) Long userId,
                               @Valid @RequestBody CreateOrderDTO request) {
        return orderService.placeOrder(userId, request);
    }

    @GetMapping
    public List<OrderDTO> getMyOrders(@RequestHeader(USER_HEADER) Long userId) {
        return orderService.getMyOrders(userId);
    }

    @PostMapping("/{orderId}/cancel")
    public OrderDTO cancelMyOrder(@RequestHeader(USER_HEADER) Long userId,
                                  @PathVariable Long orderId) {
        return orderService.cancelMyOrder(userId, orderId);
    }

    @GetMapping("/{orderId}")
    public OrderDTO getMyOrder(@RequestHeader(USER_HEADER) Long userId,
                               @PathVariable Long orderId) {
        return orderService.getMyOrder(userId, orderId);
    }
}
