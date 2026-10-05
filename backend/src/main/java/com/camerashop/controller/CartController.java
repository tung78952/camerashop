package com.camerashop.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.camerashop.dto.cart.AddCartItemDTO;
import com.camerashop.dto.cart.CartDTO;
import com.camerashop.dto.cart.UpdateCartItemDTO;
import com.camerashop.service.CartService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private static final String USER_HEADER = "X-User-Id";

    private final CartService cartService;

    @GetMapping
    public CartDTO getCart(@RequestHeader(USER_HEADER) Long userId) {
        return cartService.getCart(userId);
    }

    @PostMapping("/items")
    public CartDTO addItem(@RequestHeader(USER_HEADER) Long userId,
                           @Valid @RequestBody AddCartItemDTO request) {
        return cartService.addItem(userId, request.variantId(), request.quantity());
    }

    @PatchMapping("/items/{itemId}")
    public CartDTO updateItem(@RequestHeader(USER_HEADER) Long userId,
                              @PathVariable Long itemId,
                              @Valid @RequestBody UpdateCartItemDTO request) {
        return cartService.updateItem(userId, itemId, request.quantity());
    }

    @DeleteMapping("/items/{itemId}")
    public CartDTO removeItem(@RequestHeader(USER_HEADER) Long userId,
                              @PathVariable Long itemId) {
        return cartService.removeItem(userId, itemId);
    }
}
