// VNPay payment flow: create a signed payment URL and process the result (signature, amount, exactly-once update).

package com.camerashop.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.camerashop.entity.Order;
import com.camerashop.entity.OrderStatus;
import com.camerashop.entity.PaymentMethod;
import com.camerashop.entity.PaymentStatus;
import com.camerashop.event.OrderPaidEvent;
import com.camerashop.exception.BadRequestException;
import com.camerashop.exception.NotFoundException;
import com.camerashop.payment.VnpayService;
import com.camerashop.repository.OrderRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final VnpayService vnpayService;
    private final ApplicationEventPublisher eventPublisher;

    // Outcome of one VNPay callback, including the response code VNPay expects.
    public record VnpayResult(String code, Long orderId, boolean paid, String message) {
    }

    // Payment URL for the user's own pending, unpaid order.
    @Transactional(readOnly = true)
    public String createVnpayUrl(Long userId, Long orderId, String ipAddr) {
        if (!vnpayService.isConfigured()) {
            throw new BadRequestException("Shop chưa cấu hình VNPay (thiếu VNPAY_TMN_CODE / VNPAY_HASH_SECRET)");
        }
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đơn hàng " + orderId));
        if (order.getPaymentMethod() != PaymentMethod.VNPAY
                || order.getPaymentStatus() != PaymentStatus.UNPAID
                || order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Đơn này không cần thanh toán online");
        }
        String txnRef = order.getId() + "_" + System.currentTimeMillis();
        return vnpayService.buildPaymentUrl(txnRef, order.getTotalAmount().longValueExact(),
                "Thanh toan don hang " + order.getId(), ipAddr);
    }

    // Shared by the return page and the IPN: verify, check amount, mark PAID or FAILED once.
    @Transactional
    public VnpayResult handleVnpayResult(Map<String, String> params) {
        if (!vnpayService.verify(params)) {
            return new VnpayResult("97", null, false, "Kết quả thanh toán không hợp lệ (sai chữ ký)");
        }

        Long orderId = parseOrderId(params.get("vnp_TxnRef"));
        Order order = orderId == null ? null : orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return new VnpayResult("01", orderId, false, "Không tìm thấy đơn hàng");
        }

        BigDecimal paidAmount = new BigDecimal(params.getOrDefault("vnp_Amount", "0")).movePointLeft(2);
        if (paidAmount.compareTo(order.getTotalAmount()) != 0) {
            return new VnpayResult("04", orderId, false, "Số tiền thanh toán không khớp với đơn hàng");
        }

        boolean success = "00".equals(params.get("vnp_ResponseCode"))
                && "00".equals(params.get("vnp_TransactionStatus"));
        String txnNo = params.get("vnp_TransactionNo");

        if (success) {
            int updated = orderRepository.updatePaymentStatus(
                    orderId, PaymentStatus.UNPAID, PaymentStatus.PAID, txnNo, Instant.now());
            if (updated == 0) {
                return alreadyHandled(orderId);
            }
            eventPublisher.publishEvent(new OrderPaidEvent(orderId));
            log.info("Đơn #{} đã thanh toán VNPay, mã giao dịch {}", orderId, txnNo);
            return new VnpayResult("00", orderId, true, "Thanh toán thành công");
        }

        int updated = orderRepository.updatePaymentStatus(
                orderId, PaymentStatus.UNPAID, PaymentStatus.FAILED, txnNo, null);
        if (updated == 0) {
            return alreadyHandled(orderId);
        }
        orderService.cancelAfterFailedPayment(orderId);
        log.info("Đơn #{} thanh toán VNPay thất bại (mã {}), đã hủy + hoàn kho", orderId, params.get("vnp_ResponseCode"));
        return new VnpayResult("00", orderId, false, "Thanh toán không thành công, đơn hàng đã được hủy");
    }

    // Repeated callbacks just report the current state.
    private VnpayResult alreadyHandled(Long orderId) {
        boolean paid = orderRepository.findById(orderId)
                .map(o -> o.getPaymentStatus() == PaymentStatus.PAID)
                .orElse(false);
        return new VnpayResult("02", orderId, paid,
                paid ? "Thanh toán thành công" : "Thanh toán không thành công, đơn hàng đã được hủy");
    }

    // Extracts the order id from the transaction reference.
    private static Long parseOrderId(String txnRef) {
        if (txnRef == null) {
            return null;
        }
        try {
            return Long.valueOf(txnRef.split("_")[0]);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
