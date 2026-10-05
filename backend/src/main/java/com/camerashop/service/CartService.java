package com.camerashop.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.camerashop.dto.cart.CartDTO;
import com.camerashop.dto.cart.CartItemDTO;
import com.camerashop.entity.Cart;
import com.camerashop.entity.CartItem;
import com.camerashop.entity.ProductVariant;
import com.camerashop.entity.User;
import com.camerashop.exception.NotFoundException;
import com.camerashop.exception.OutOfStockException;
import com.camerashop.repository.CartRepository;
import com.camerashop.repository.ProductVariantRepository;
import com.camerashop.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public CartDTO getCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .map(cart -> toDTO(cart))
                .orElse(CartDTO.empty());
    }

    @Transactional
    public CartDTO addItem(Long userId, Long variantId, int quantity) {
        Cart cart = findOrCreateCart(userId);
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy phiên bản sản phẩm " + variantId));

        CartItem existing = findItemByVariant(cart, variantId);
        int newQuantity = (existing == null ? 0 : existing.getQuantity()) + quantity;
        checkStock(variant, newQuantity);

        if (existing == null) {
            cart.addItem(variant, quantity);
        } else {
            existing.setQuantity(newQuantity);
        }
        cartRepository.saveAndFlush(cart);
        return toDTO(cart);
    }

    @Transactional
    public CartDTO updateItem(Long userId, Long itemId, int quantity) {
        Cart cart = findCartOrThrow(userId);
        CartItem item = findItemOrThrow(cart, itemId);
        checkStock(item.getProductVariant(), quantity);
        item.setQuantity(quantity);
        return toDTO(cart);
    }

    @Transactional
    public CartDTO removeItem(Long userId, Long itemId) {
        Cart cart = findCartOrThrow(userId);
        CartItem item = findItemOrThrow(cart, itemId);
        cart.getItems().remove(item);
        return toDTO(cart);
    }

    private Cart findOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng " + userId));
            return cartRepository.save(new Cart(user));
        });
    }

    private Cart findCartOrThrow(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Giỏ hàng đang trống"));
    }

    private CartItem findItemOrThrow(Cart cart, Long itemId) {
        return cart.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Không tìm thấy món " + itemId + " trong giỏ"));
    }

    private CartItem findItemByVariant(Cart cart, Long variantId) {
        return cart.getItems().stream()
                .filter(item -> item.getProductVariant().getId().equals(variantId))
                .findFirst()
                .orElse(null);
    }

    private void checkStock(ProductVariant variant, int wantedQuantity) {
        if (wantedQuantity > variant.getStock()) {
            String name = variant.getProduct().getName() + " (" + variant.getName() + ")";
            String message = variant.getStock() == 0
                    ? name + " đã hết hàng"
                    : name + " chỉ còn " + variant.getStock() + " sản phẩm";
            throw new OutOfStockException(message);
        }
    }

    private CartDTO toDTO(Cart cart) {
        List<CartItemDTO> items = cart.getItems().stream()
                .map(item -> CartItemDTO.from(item))
                .toList();
        return CartDTO.from(items);
    }
}
