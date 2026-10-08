package com.camerashop.controller;

import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.camerashop.security.CurrentUser;
import com.camerashop.service.PaymentService;
import com.camerashop.service.PaymentService.VnpayResult;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments/vnpay")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    public record PaymentUrlDTO(String paymentUrl) {
    }

    public record PaymentResultDTO(Long orderId, boolean paid, String message) {
    }

    @PostMapping("/{orderId}")
    public PaymentUrlDTO createPaymentUrl(@AuthenticationPrincipal Jwt jwt,
                                          @PathVariable Long orderId,
                                          HttpServletRequest request) {
        String url = paymentService.createVnpayUrl(CurrentUser.id(jwt), orderId, clientIp(request));
        return new PaymentUrlDTO(url);
    }

    @GetMapping("/return")
    public PaymentResultDTO handleReturn(@RequestParam Map<String, String> params) {
        VnpayResult result = paymentService.handleVnpayResult(params);
        return new PaymentResultDTO(result.orderId(), result.paid(), result.message());
    }

    @GetMapping("/ipn")
    public Map<String, String> handleIpn(@RequestParam Map<String, String> params) {
        VnpayResult result = paymentService.handleVnpayResult(params);
        String message = switch (result.code()) {
            case "00" -> "Confirm Success";
            case "01" -> "Order not found";
            case "02" -> "Order already confirmed";
            case "04" -> "Invalid amount";
            case "97" -> "Invalid signature";
            default -> "Unknown error";
        };
        return Map.of("RspCode", result.code(), "Message", message);
    }

    private static String clientIp(HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        return ip == null || ip.contains(":") ? "127.0.0.1" : ip;
    }
}
