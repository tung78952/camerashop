// Checkout (with oversell protection), order history, cancellation and admin status changes with restocking.

package com.camerashop.service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.camerashop.dto.order.CreateOrderDTO;
import com.camerashop.dto.order.OrderDTO;
import com.camerashop.entity.Cart;
import com.camerashop.entity.CartItem;
import com.camerashop.entity.Order;
import com.camerashop.entity.OrderItem;
import com.camerashop.entity.OrderStatus;
import com.camerashop.entity.PaymentMethod;
import com.camerashop.entity.PaymentStatus;
import com.camerashop.entity.ProductVariant;
import com.camerashop.event.OrderPlacedEvent;
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
    private final ApplicationEventPublisher eventPublisher;

    // Creates an order from the cart in one transaction: atomic stock decrement per item, server-side prices.
    @Transactional
    public OrderDTO placeOrder(Long userId, CreateOrderDTO request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Giỏ hàng đang trống"));
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Giỏ hàng đang trống");
        }

        Order order = new Order(cart.getUser(), request.receiverName(), request.phone(), request.address());
        order.setPaymentMethod(request.paymentMethod() != null ? request.paymentMethod() : PaymentMethod.COD);

        List<CartItem> items = cart.getItems().stream()
                .sorted(Comparator.comparing(item -> item.getProductVariant().getId()))
                .toList();

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : items) {
            ProductVariant variant = item.getProductVariant();
            if (!variant.getProduct().isActive()) {
                throw new BadRequestException(variant.getProduct().getName() + " đã ngừng bán, vui lòng xóa khỏi giỏ");
            }

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

        eventPublisher.publishEvent(new OrderPlacedEvent(order.getId()));

        return OrderDTO.from(order);
    }

    // The current user's orders, newest first.
    @Transactional(readOnly = true)
    public List<OrderDTO> getMyOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(order -> OrderDTO.from(order))
                .toList();
    }

    // One of the current user's orders (orders of other users return 404).
    @Transactional(readOnly = true)
    public OrderDTO getMyOrder(Long userId, Long orderId) {
        return orderRepository.findByIdAndUserId(orderId, userId)
                .map(order -> OrderDTO.from(order))
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đơn hàng " + orderId));
    }

    // Customer cancels a pending order; stock is restored.
    @Transactional
    public OrderDTO cancelMyOrder(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đơn hàng " + orderId));
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("Đơn đã thanh toán online, vui lòng liên hệ shop để hủy và hoàn tiền");
        }
        return changeStatus(order, OrderStatus.CANCELLED);
    }

    // Cancels and restocks an order whose VNPay payment failed.
    @Transactional
    public void cancelAfterFailedPayment(Long orderId) {
        Order order = orderRepository.findWithItemsById(orderId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đơn hàng " + orderId));
        if (order.getStatus().canChangeTo(OrderStatus.CANCELLED)) {
            changeStatus(order, OrderStatus.CANCELLED);
        }
    }

    // Admin moves an order along the allowed status flow.
    @Transactional
    public OrderDTO changeStatusByAdmin(Long orderId, OrderStatus next) {
        Order order = orderRepository.findWithItemsById(orderId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đơn hàng " + orderId));
        return changeStatus(order, next);
    }

    // All orders for the admin page.
    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(order -> OrderDTO.from(order))
                .toList();
    }

    // Validates the transition, updates it race-safely and restocks on cancellation.
    private OrderDTO changeStatus(Order order, OrderStatus next) {
        OrderStatus current = order.getStatus();

        if (!current.canChangeTo(next)) {
            throw new BadRequestException("Không thể chuyển đơn từ \"" + current.getLabel()
                    + "\" sang \"" + next.getLabel() + "\"");
        }

        List<OrderItem> itemsToRestock = next == OrderStatus.CANCELLED ? List.copyOf(order.getItems()) : List.of();
        List<RestockLine> restock = itemsToRestock.stream()
                .map(item -> new RestockLine(item.getProductVariant().getId(), item.getQuantity()))
                .toList();

        int updated = orderRepository.updateStatus(order.getId(), current, next);
        if (updated == 0) {
            throw new BadRequestException("Đơn hàng vừa được cập nhật, vui lòng tải lại trang");
        }

        for (RestockLine line : restock) {
            productVariantRepository.increaseStock(line.variantId(), line.quantity());
        }

        Order reloaded = orderRepository.findWithItemsById(order.getId()).orElseThrow();
        return OrderDTO.from(reloaded);
    }

    private record RestockLine(Long variantId, int quantity) {
    }
}
