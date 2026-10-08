package com.camerashop.service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.camerashop.entity.Order;
import com.camerashop.entity.OrderItem;
import com.camerashop.event.OrderPlacedEvent;
import com.camerashop.repository.OrderRepository;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class OrderMailListener {

    private static final NumberFormat VND = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("vi-VN"));

    private final JavaMailSender mailSender;
    private final OrderRepository orderRepository;
    private final String from;
    private final String frontendUrl;

    public OrderMailListener(JavaMailSender mailSender,
                             OrderRepository orderRepository,
                             @Value("${app.mail.from}") String from,
                             @Value("${app.frontend-url}") String frontendUrl) {
        this.mailSender = mailSender;
        this.orderRepository = orderRepository;
        this.from = from;
        this.frontendUrl = frontendUrl;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public void onOrderPlaced(OrderPlacedEvent event) {
        Order order = orderRepository.findWithItemsById(event.orderId()).orElse(null);
        if (order == null) {
            return;
        }
        String to = order.getUser().getEmail();
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(from);
            mail.setTo(to);
            mail.setSubject("CameraShop – Xác nhận đơn hàng #" + order.getId());
            mail.setText(buildBody(order));
            mailSender.send(mail);
            log.info("Đã gửi mail xác nhận đơn #{} tới {}", order.getId(), to);
        } catch (MailException ex) {
            log.warn("Không gửi được mail đơn #{} tới {}: {}", order.getId(), to, ex.getMessage());
        }
    }

    private String buildBody(Order order) {
        StringBuilder body = new StringBuilder();
        body.append("Xin chào ").append(order.getUser().getName()).append(",\n\n");
        body.append("CameraShop đã nhận đơn hàng #").append(order.getId()).append(" của bạn.\n\n");
        body.append("Sản phẩm:\n");
        for (OrderItem item : order.getItems()) {
            BigDecimal lineTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            body.append("  - ").append(item.getProductVariant().getProduct().getName())
                    .append(" (").append(item.getProductVariant().getName()).append(")")
                    .append(" x ").append(item.getQuantity())
                    .append(" = ").append(VND.format(lineTotal)).append("\n");
        }
        body.append("\nTổng tiền: ").append(VND.format(order.getTotalAmount())).append("\n\n");
        body.append("Giao tới: ").append(order.getReceiverName()).append(" – ").append(order.getPhone()).append("\n");
        body.append("Địa chỉ: ").append(order.getAddress()).append("\n");
        body.append("Trạng thái: ").append(order.getStatus().getLabel()).append("\n\n");
        body.append("Xem đơn hàng: ").append(frontendUrl).append("/orders/").append(order.getId()).append("\n\n");
        body.append("Cảm ơn bạn đã mua sắm tại CameraShop!\n");
        return body.toString();
    }
}
