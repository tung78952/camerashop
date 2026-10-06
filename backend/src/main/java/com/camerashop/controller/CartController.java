package com.camerashop.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.camerashop.dto.cart.AddCartItemDTO;
import com.camerashop.dto.cart.CartDTO;
import com.camerashop.dto.cart.UpdateCartItemDTO;
import com.camerashop.security.CurrentUser;
import com.camerashop.service.CartService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public CartDTO getCart(@AuthenticationPrincipal Jwt jwt) {
        return cartService.getCart(CurrentUser.id(jwt));
    }

    @PostMapping("/items")
    public CartDTO addItem(@AuthenticationPrincipal Jwt jwt,
                           @Valid @RequestBody AddCartItemDTO request) {
        return cartService.addItem(CurrentUser.id(jwt), request.variantId(), request.quantity());
    }

    @PatchMapping("/items/{itemId}")
    public CartDTO updateItem(@AuthenticationPrincipal Jwt jwt,
                              @PathVariable Long itemId,
                              @Valid @RequestBody UpdateCartItemDTO request) {
        return cartService.updateItem(CurrentUser.id(jwt), itemId, request.quantity());
    }

    @DeleteMapping("/items/{itemId}")
    public CartDTO removeItem(@AuthenticationPrincipal Jwt jwt,
                              @PathVariable Long itemId) {
        return cartService.removeItem(CurrentUser.id(jwt), itemId);
    }
}
