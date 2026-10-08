package com.camerashop.payment;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.Map;
import java.util.StringJoiner;
import java.util.TreeMap;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class VnpayService {

    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter VNP_DATE = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final String tmnCode;
    private final String hashSecret;
    private final String payUrl;
    private final String returnUrl;

    public VnpayService(@Value("${app.vnpay.tmn-code}") String tmnCode,
                        @Value("${app.vnpay.hash-secret}") String hashSecret,
                        @Value("${app.vnpay.pay-url}") String payUrl,
                        @Value("${app.vnpay.return-url}") String returnUrl) {
        this.tmnCode = tmnCode;
        this.hashSecret = hashSecret;
        this.payUrl = payUrl;
        this.returnUrl = returnUrl;
    }

    public boolean isConfigured() {
        return !tmnCode.isBlank() && !hashSecret.isBlank();
    }

    public String buildPaymentUrl(String txnRef, long amountVnd, String orderInfo, String ipAddr) {
        return buildPaymentUrl(txnRef, amountVnd, orderInfo, ipAddr, LocalDateTime.now(VIETNAM));
    }

    String buildPaymentUrl(String txnRef, long amountVnd, String orderInfo, String ipAddr, LocalDateTime now) {
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", tmnCode);
        params.put("vnp_Amount", String.valueOf(amountVnd * 100));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", orderInfo);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", ipAddr);
        params.put("vnp_CreateDate", now.format(VNP_DATE));
        params.put("vnp_ExpireDate", now.plusMinutes(15).format(VNP_DATE));

        String query = encode(params);
        return payUrl + "?" + query + "&vnp_SecureHash=" + hmacSha512(hashSecret, query);
    }

    public boolean verify(Map<String, String> vnpParams) {
        String receivedHash = vnpParams.get("vnp_SecureHash");
        if (receivedHash == null || hashSecret.isBlank()) {
            return false;
        }
        Map<String, String> fields = new TreeMap<>();
        vnpParams.forEach((key, value) -> {
            if (key.startsWith("vnp_") && !key.equals("vnp_SecureHash") && !key.equals("vnp_SecureHashType")
                    && value != null && !value.isEmpty()) {
                fields.put(key, value);
            }
        });
        String expectedHash = hmacSha512(hashSecret, encode(fields));
        return MessageDigest.isEqual(
                expectedHash.getBytes(StandardCharsets.US_ASCII),
                receivedHash.toLowerCase().getBytes(StandardCharsets.US_ASCII));
    }

    private static String encode(Map<String, String> sortedParams) {
        StringJoiner joiner = new StringJoiner("&");
        sortedParams.forEach((key, value) ->
                joiner.add(key + "=" + URLEncoder.encode(value, StandardCharsets.US_ASCII)));
        return joiner.toString();
    }

    static String hmacSha512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            return HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException | InvalidKeyException ex) {
            throw new IllegalStateException("Không tạo được chữ ký VNPay", ex);
        }
    }
}
