// Customer order endpoints: checkout, my orders, order detail and cancel.

package com.camerashop.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.camerashop.dto.order.CreateOrderDTO;
import com.camerashop.dto.order.OrderDTO;
import com.camerashop.security.CurrentUser;
import com.camerashop.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderDTO placeOrder(@AuthenticationPrincipal Jwt jwt,
                               @Valid @RequestBody CreateOrderDTO request) {
        return orderService.placeOrder(CurrentUser.id(jwt), request);
    }

    @GetMapping
    public List<OrderDTO> getMyOrders(@AuthenticationPrincipal Jwt jwt) {
        return orderService.getMyOrders(CurrentUser.id(jwt));
    }

    @PostMapping("/{orderId}/cancel")
    public OrderDTO cancelMyOrder(@AuthenticationPrincipal Jwt jwt,
                                  @PathVariable Long orderId) {
        return orderService.cancelMyOrder(CurrentUser.id(jwt), orderId);
    }

    @GetMapping("/{orderId}")
    public OrderDTO getMyOrder(@AuthenticationPrincipal Jwt jwt,
                               @PathVariable Long orderId) {
        return orderService.getMyOrder(CurrentUser.id(jwt), orderId);
    }
}
