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
import org.springframework.web.util.HtmlUtils;

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
            String introText = intro.formatted(order.getId());
            emailSender.send(from, to, subjectPrefix + order.getId(), buildBody(order, introText), buildHtml(order, introText));
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

    private String buildHtml(Order order, String intro) {
        StringBuilder rows = new StringBuilder();
        for (OrderItem item : order.getItems()) {
            BigDecimal lineTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            rows.append("""
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid #eee;">%s<br><span style="color:#888;font-size:13px;">%s × %d</span></td>
                      <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">%s</td>
                    </tr>
                    """.formatted(esc(item.getProductVariant().getProduct().getName()), esc(item.getProductVariant().getName()),
                    item.getQuantity(), VND.format(lineTotal)));
        }
        String orderLink = frontendUrl + "/orders/" + order.getId();
        return """
                <!doctype html>
                <html><body style="margin:0;padding:24px 0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#222;">
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0"><tr><td align="center">
                <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%%;background:#fff;border-radius:10px;overflow:hidden;">
                  <tr><td style="background:#dc2626;padding:18px 24px;color:#fff;font-size:22px;font-weight:bold;">CameraShop</td></tr>
                  <tr><td style="padding:24px;font-size:15px;line-height:1.5;">
                    <p style="margin:0 0 8px;">Xin chào <b>%s</b>,</p>
                    <p style="margin:0 0 20px;">%s</p>
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                      %s
                      <tr>
                        <td style="padding:14px 0 4px;font-weight:bold;">Tổng cộng</td>
                        <td style="padding:14px 0 4px;text-align:right;font-weight:bold;color:#dc2626;font-size:17px;white-space:nowrap;">%s</td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin-top:18px;background:#f9fafb;border-radius:8px;font-size:14px;">
                      <tr><td style="padding:14px 16px;">
                        <b>Thanh toán:</b> %s – %s<br>
                        <b>Giao tới:</b> %s – %s<br>
                        <b>Địa chỉ:</b> %s<br>
                        <b>Trạng thái:</b> %s
                      </td></tr>
                    </table>
                    <p style="margin:24px 0 8px;text-align:center;">
                      <a href="%s" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:bold;">Xem đơn hàng</a>
                    </p>
                  </td></tr>
                  <tr><td style="padding:14px 24px;background:#fafafa;color:#888;font-size:12px;text-align:center;">
                    Cảm ơn bạn đã mua sắm tại CameraShop! Đây là email tự động, vui lòng không trả lời.
                  </td></tr>
                </table>
                </td></tr></table>
                </body></html>
                """.formatted(
                esc(order.getUser().getName()), esc(intro), rows, VND.format(order.getTotalAmount()),
                order.getPaymentMethod().getLabel(), order.getPaymentStatus().getLabel(),
                esc(order.getReceiverName()), esc(order.getPhone()), esc(order.getAddress()),
                order.getStatus().getLabel(), esc(orderLink));
    }

    private static String esc(String text) {
        return text == null ? "" : HtmlUtils.htmlEscape(text, "UTF-8");
    }
}
