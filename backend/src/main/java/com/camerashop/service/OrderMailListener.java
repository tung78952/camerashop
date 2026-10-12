package com.camerashop.service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.camerashop.entity.Order;
import com.camerashop.entity.OrderItem;
import com.camerashop.event.OrderPaidEvent;
import com.camerashop.event.OrderPlacedEvent;
import com.camerashop.mail.EmailSendException;
import com.camerashop.mail.EmailSender;
import com.camerashop.repository.OrderRepository;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class OrderMailListener {

    private static final NumberFormat VND = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("vi-VN"));

    private final EmailSender emailSender;
    private final OrderRepository orderRepository;
    private final String from;
    private final String frontendUrl;

    public OrderMailListener(EmailSender emailSender,
                             OrderRepository orderRepository,
                             @Value("${app.mail.from}") String from,
                             @Value("${app.frontend-url}") String frontendUrl) {
        this.emailSender = emailSender;
        this.orderRepository = orderRepository;
        this.from = from;
        this.frontendUrl = frontendUrl;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public void onOrderPlaced(OrderPlacedEvent event) {
        send(event.orderId(), "CameraShop – Xác nhận đơn hàng #", "CameraShop đã nhận đơn hàng #%d của bạn.");
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public void onOrderPaid(OrderPaidEvent event) {
        send(event.orderId(), "CameraShop – Đã thanh toán đơn hàng #",
                "CameraShop đã nhận được thanh toán VNPay cho đơn hàng #%d của bạn.");
    }

    private void send(Long orderId, String subjectPrefix, String intro) {
        Order order = orderRepository.findWithItemsById(orderId).orElse(null);
        if (order == null) {
            return;
        }
        String to = order.getUser().getEmail();
        try {
            emailSender.send(from, to, subjectPrefix + order.getId(), buildBody(order, intro.formatted(order.getId())));
            log.info("Đã gửi mail \"{}{}\" tới {}", subjectPrefix, order.getId(), to);
        } catch (EmailSendException ex) {
            log.warn("Không gửi được mail đơn #{} tới {}: {}", order.getId(), to, ex.getMessage());
        }
    }

    private String buildBody(Order order, String intro) {
        StringBuilder body = new StringBuilder();
        body.append("Xin chào ").append(order.getUser().getName()).append(",\n\n");
        body.append(intro).append("\n\n");
        body.append("Sản phẩm:\n");
        for (OrderItem item : order.getItems()) {
            BigDecimal lineTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            body.append("  - ").append(item.getProductVariant().getProduct().getName())
                    .append(" (").append(item.getProductVariant().getName()).append(")")
                    .append(" x ").append(item.getQuantity())
                    .append(" = ").append(VND.format(lineTotal)).append("\n");
        }
        body.append("\nTổng tiền: ").append(VND.format(order.getTotalAmount())).append("\n");
        body.append("Thanh toán: ").append(order.getPaymentMethod().getLabel())
                .append(" – ").append(order.getPaymentStatus().getLabel()).append("\n\n");
        body.append("Giao tới: ").append(order.getReceiverName()).append(" – ").append(order.getPhone()).append("\n");
        body.append("Địa chỉ: ").append(order.getAddress()).append("\n");
        body.append("Trạng thái: ").append(order.getStatus().getLabel()).append("\n\n");
        body.append("Xem đơn hàng: ").append(frontendUrl).append("/orders/").append(order.getId()).append("\n\n");
        body.append("Cảm ơn bạn đã mua sắm tại CameraShop!\n");
        return body.toString();
    }
}
