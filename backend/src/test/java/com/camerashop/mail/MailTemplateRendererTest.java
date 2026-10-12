// Email template tests: data is filled in, user input is HTML-escaped, the plain-text version is correct.

package com.camerashop.mail;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import com.camerashop.mail.MailTemplateRenderer.RenderedMail;

class MailTemplateRendererTest {

    private final MailTemplateRenderer renderer = new MailTemplateRenderer();

    private static Map<String, Object> orderData() {
        Map<String, Object> data = new HashMap<>();
        data.put("customerName", "<b>Hack</b> Tùng");
        data.put("intro", "CameraShop đã nhận đơn hàng #7 của bạn.");
        data.put("items", List.of(
                Map.of("productName", "Sony FE 85mm F1.8", "variantName", "Tiêu chuẩn", "quantity", 2, "lineTotal", "27.980.000 ₫"),
                Map.of("productName", "Sony FE 50mm F1.8", "variantName", "Tiêu chuẩn", "quantity", 1, "lineTotal", "5.490.000 ₫")));
        data.put("total", "33.470.000 ₫");
        data.put("payment", "Thanh toán khi nhận hàng – Chưa thanh toán");
        data.put("receiver", "Tùng – 0901234567");
        data.put("address", "1 Lê Lợi, Quận 1");
        data.put("status", "Chờ xác nhận");
        data.put("orderUrl", "https://www.tcamerashop.store/orders/7");
        return data;
    }

    @Test
    void htmlVersionIsFilledAndEscaped() {
        String html = renderer.render("order", orderData()).html();

        assertTrue(html.contains("&lt;b&gt;Hack&lt;/b&gt; Tùng"), html);
        assertFalse(html.contains("<b>Hack</b>"));
        assertTrue(html.contains("Sony FE 85mm F1.8") && html.contains("Sony FE 50mm F1.8"));
        assertTrue(html.contains("Tiêu chuẩn × 2"));
        assertTrue(html.contains("33.470.000 ₫"));
        assertTrue(html.contains("href=\"https://www.tcamerashop.store/orders/7\""));
        assertFalse(html.contains("FILE NÀY"));
        assertFalse(html.contains("th:text") || html.contains("th:each") || html.contains("th:href"));
    }

    @Test
    void textVersionIsPlain() {
        RenderedMail mail = renderer.render("order", orderData());

        assertTrue(mail.text().startsWith("Xin chào <b>Hack</b> Tùng,"), mail.text());
        assertTrue(mail.text().contains("  - Sony FE 85mm F1.8 (Tiêu chuẩn) x 2 = 27.980.000 ₫"), mail.text());
        assertTrue(mail.text().contains("  - Sony FE 50mm F1.8 (Tiêu chuẩn) x 1 = 5.490.000 ₫"), mail.text());
        assertTrue(mail.text().contains("Xem đơn hàng: https://www.tcamerashop.store/orders/7"));
    }
}
