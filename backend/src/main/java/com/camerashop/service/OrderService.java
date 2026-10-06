package com.camerashop.service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.camerashop.dto.order.CreateOrderDTO;
import com.camerashop.dto.order.OrderDTO;
import com.camerashop.entity.Cart;
import com.camerashop.entity.CartItem;
import com.camerashop.entity.Order;
import com.camerashop.entity.ProductVariant;
import com.camerashop.exception.BadRequestException;
import com.camerashop.exception.NotFoundException;
import com.camerashop.exception.OutOfStockException;
import com.camerashop.repository.CartRepository;
import com.camerashop.repository.OrderRepository;
import com.camerashop.repository.ProductVariantRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final ProductVariantRepository productVariantRepository;

    @Transactional
    public OrderDTO placeOrder(Long userId, CreateOrderDTO request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Giỏ hàng đang trống"));
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Giỏ hàng đang trống");
        }

        Order order = new Order(cart.getUser(), request.receiverName(), request.phone(), request.address());

        List<CartItem> items = cart.getItems().stream()
                .sorted(Comparator.comparing(item -> item.getProductVariant().getId()))
                .toList();

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : items) {
            ProductVariant variant = item.getProductVariant();

            int updated = productVariantRepository.decreaseStock(variant.getId(), item.getQuantity());
            if (updated == 0) {
                throw new OutOfStockException(variant.getProduct().getName() + " (" + variant.getName()
                        + ") không đủ hàng, vui lòng giảm số lượng trong giỏ");
            }

            order.addItem(variant, item.getQuantity(), variant.getPrice());
            total = total.add(variant.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        order.setTotalAmount(total);
        orderRepository.save(order);

        cart.getItems().clear();

        return OrderDTO.from(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getMyOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(order -> OrderDTO.from(order))
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderDTO getMyOrder(Long userId, Long orderId) {
        return orderRepository.findByIdAndUserId(orderId, userId)
                .map(order -> OrderDTO.from(order))
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đơn hàng " + orderId));
    }
}
