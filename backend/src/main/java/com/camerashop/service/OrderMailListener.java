package com.camerashop.service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

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
import com.camerashop.mail.MailTemplateRenderer;
import com.camerashop.mail.MailTemplateRenderer.RenderedMail;
import com.camerashop.repository.OrderRepository;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class OrderMailListener {

    private static final NumberFormat VND = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("vi-VN"));

    private final EmailSender emailSender;
    private final MailTemplateRenderer renderer;
    private final OrderRepository orderRepository;
    private final String from;
    private final String frontendUrl;

    public OrderMailListener(EmailSender emailSender,
                             MailTemplateRenderer renderer,
                             OrderRepository orderRepository,
                             @Value("${app.mail.from}") String from,
                             @Value("${app.frontend-url}") String frontendUrl) {
        this.emailSender = emailSender;
        this.renderer = renderer;
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
            RenderedMail mail = renderer.render("order", orderVariables(order, intro.formatted(order.getId())));
            emailSender.send(from, to, subjectPrefix + order.getId(), mail.text(), mail.html());
            log.info("Đã gửi mail \"{}{}\" tới {}", subjectPrefix, order.getId(), to);
        } catch (EmailSendException ex) {
            log.warn("Không gửi được mail đơn #{} tới {}: {}", order.getId(), to, ex.getMessage());
        }
    }

    private Map<String, Object> orderVariables(Order order, String intro) {
        List<Map<String, Object>> items = order.getItems().stream()
                .map(item -> Map.<String, Object>of(
                        "productName", item.getProductVariant().getProduct().getName(),
                        "variantName", item.getProductVariant().getName(),
                        "quantity", item.getQuantity(),
                        "lineTotal", VND.format(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))))
                .toList();
        Map<String, Object> variables = new HashMap<>();
        variables.put("customerName", order.getUser().getName());
        variables.put("intro", intro);
        variables.put("items", items);
        variables.put("total", VND.format(order.getTotalAmount()));
        variables.put("payment", order.getPaymentMethod().getLabel() + " – " + order.getPaymentStatus().getLabel());
        variables.put("receiver", order.getReceiverName() + " – " + order.getPhone());
        variables.put("address", order.getAddress());
        variables.put("status", order.getStatus().getLabel());
        variables.put("orderUrl", frontendUrl + "/orders/" + order.getId());
        return variables;
    }
}
