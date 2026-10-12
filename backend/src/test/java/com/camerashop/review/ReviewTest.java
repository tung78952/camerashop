// Review rules: public read, 401 for guests, 403 before the order is completed, one review per user.

package com.camerashop.review;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasItem;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.support.TransactionTemplate;

import com.camerashop.TestcontainersConfig;
import com.camerashop.dto.order.CreateOrderDTO;
import com.camerashop.dto.order.OrderDTO;
import com.camerashop.entity.Cart;
import com.camerashop.entity.OrderStatus;
import com.camerashop.entity.PaymentMethod;
import com.camerashop.entity.ProductVariant;
import com.camerashop.entity.Role;
import com.camerashop.entity.User;
import com.camerashop.repository.CartRepository;
import com.camerashop.repository.ProductVariantRepository;
import com.camerashop.repository.UserRepository;
import com.camerashop.security.JwtService;
import com.camerashop.service.OrderService;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfig.class)
class ReviewTest {

    private static final String SKU = "SONY-SEL85F18";

    @Autowired private MockMvc mockMvc;
    @Autowired private OrderService orderService;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository userRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private ProductVariantRepository variantRepository;
    @Autowired private TransactionTemplate transaction;

    private Long productId;
    private Long userId;
    private String token;

    @BeforeEach
    void setUp() {
        transaction.executeWithoutResult(status -> {
            ProductVariant variant = variantRepository.findBySku(SKU).orElseThrow();
            variant.setStock(10);
            productId = variant.getProduct().getId();
            User user = userRepository.save(
                    new User("Khách Đánh Giá", "review-" + UUID.randomUUID() + "@test.local", "x", Role.CUSTOMER));
            userId = user.getId();
            token = jwtService.issue(user).token();
        });
    }

    @Test
    void guestCanReadButNotWrite() throws Exception {
        mockMvc.perform(get(reviewsUrl()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.starCounts.length()").value(5))
                .andExpect(jsonPath("$.reviews").isArray());
        mockMvc.perform(get(reviewsUrl() + "/mine"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(put(reviewsUrl() + "/mine").contentType(MediaType.APPLICATION_JSON).content(form(5, "Tốt")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void pendingOrderIsNotEnough() throws Exception {
        placeOrder();

        mockMvc.perform(get(reviewsUrl() + "/mine").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.canReview").value(false))
                .andExpect(jsonPath("$.myReview").doesNotExist());
        mockMvc.perform(put(reviewsUrl() + "/mine").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(form(5, "Chưa nhận hàng mà khen")))
                .andExpect(status().isForbidden());
    }

    @Test
    void buyerWritesThenEditsTheSameReview() throws Exception {
        OrderDTO order = placeOrder();
        orderService.changeStatusByAdmin(order.id(), OrderStatus.SHIPPING);
        orderService.changeStatusByAdmin(order.id(), OrderStatus.COMPLETED);
        long before = reviewCount();

        mockMvc.perform(get(reviewsUrl() + "/mine").header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.canReview").value(true));

        mockMvc.perform(put(reviewsUrl() + "/mine").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(form(4, "  Xóa phông đẹp  ")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(4))
                .andExpect(jsonPath("$.comment").value("Xóa phông đẹp"))
                .andExpect(jsonPath("$.reviewerName").value("Khách Đánh Giá"));
        assertEquals(before + 1, reviewCount());

        mockMvc.perform(put(reviewsUrl() + "/mine").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(form(5, "Dùng 1 tháng vẫn ưng")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(5));
        assertEquals(before + 1, reviewCount());
        mockMvc.perform(get(reviewsUrl()))
                .andExpect(jsonPath("$.reviews[*].comment").value(hasItem("Dùng 1 tháng vẫn ưng")))
                .andExpect(jsonPath("$.starCounts[0]").value(greaterThanOrEqualTo(1)));

        mockMvc.perform(get("/api/products").param("q", "85mm"))
                .andExpect(jsonPath("$.items[0].ratingCount").value(greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.items[0].ratingAverage").value(greaterThanOrEqualTo(1.0)));

        mockMvc.perform(put(reviewsUrl() + "/mine").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(form(6, "Quá đỉnh")))
                .andExpect(status().isBadRequest());
    }

    private String reviewsUrl() {
        return "/api/products/" + productId + "/reviews";
    }

    private static String form(int rating, String comment) {
        return "{\"rating\":" + rating + ",\"comment\":\"" + comment + "\"}";
    }

    private OrderDTO placeOrder() {
        transaction.executeWithoutResult(status -> {
            Cart cart = new Cart(userRepository.findById(userId).orElseThrow());
            cart.addItem(variantRepository.findBySku(SKU).orElseThrow(), 1);
            cartRepository.save(cart);
        });
        return orderService.placeOrder(userId,
                new CreateOrderDTO("Khách Đánh Giá", "0901234567", "1 Lê Lợi, Q1", PaymentMethod.COD));
    }

    private long reviewCount() throws Exception {
        String body = mockMvc.perform(get(reviewsUrl())).andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        Matcher m = Pattern.compile("\"count\":(\\d+)").matcher(body);
        m.find();
        return Long.parseLong(m.group(1));
    }
}
