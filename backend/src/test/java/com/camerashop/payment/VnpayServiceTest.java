// VNPay signing tests: signed URL, valid signature, tampered amount, forged result, missing signature.

package com.camerashop.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;

class VnpayServiceTest {

    private final VnpayService vnpay = new VnpayService(
            "TESTCODE", "TEST-SECRET-KEY", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
            "http://localhost:3000/payment/vnpay-return");

    private final LocalDateTime now = LocalDateTime.of(2026, 10, 8, 15, 30, 0);

    @Test
    void paymentUrlContainsSignedOrderInfo() {
        String url = vnpay.buildPaymentUrl("10_20261008153000", 6_990_000, "Thanh toan don hang 10", "127.0.0.1", now);
        Map<String, String> params = parseQuery(url);

        assertTrue(url.startsWith("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?"));
        assertEquals("699000000", params.get("vnp_Amount"));
        assertEquals("TESTCODE", params.get("vnp_TmnCode"));
        assertEquals("10_20261008153000", params.get("vnp_TxnRef"));
        assertEquals("20261008153000", params.get("vnp_CreateDate"));
        assertEquals("20261008154500", params.get("vnp_ExpireDate"));
        assertEquals(128, params.get("vnp_SecureHash").length());
    }

    @Test
    void untouchedParamsAreValid() {
        Map<String, String> params = parseQuery(
                vnpay.buildPaymentUrl("10_1", 6_990_000, "Thanh toan don hang 10", "127.0.0.1", now));
        assertTrue(vnpay.verify(params));
    }

    @Test
    void tamperedAmountIsRejected() {
        Map<String, String> params = parseQuery(
                vnpay.buildPaymentUrl("10_1", 6_990_000, "Thanh toan don hang 10", "127.0.0.1", now));
        params.put("vnp_Amount", "100000");
        assertFalse(vnpay.verify(params));
    }

    @Test
    void forgedSuccessResultIsRejected() {
        Map<String, String> forged = new HashMap<>();
        forged.put("vnp_TxnRef", "10_1");
        forged.put("vnp_Amount", "699000000");
        forged.put("vnp_ResponseCode", "00");
        forged.put("vnp_SecureHash", VnpayService.hmacSha512("doan-bua-mot-bi-mat", "vnp_Amount=699000000"));
        assertFalse(vnpay.verify(forged));
    }

    @Test
    void missingSignatureIsRejected() {
        Map<String, String> params = parseQuery(
                vnpay.buildPaymentUrl("10_1", 6_990_000, "Thanh toan don hang 10", "127.0.0.1", now));
        params.remove("vnp_SecureHash");
        assertFalse(vnpay.verify(params));
    }

    private static Map<String, String> parseQuery(String url) {
        Map<String, String> result = new HashMap<>();
        for (String pair : url.substring(url.indexOf('?') + 1).split("&")) {
            int eq = pair.indexOf('=');
            result.put(URLDecoder.decode(pair.substring(0, eq), StandardCharsets.UTF_8),
                    URLDecoder.decode(pair.substring(eq + 1), StandardCharsets.UTF_8));
        }
        return result;
    }
}
