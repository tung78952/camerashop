// VNPay flow tests: success, duplicate callbacks, failure with restock, wrong amount, forged result and access rules.

package com.camerashop.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.support.TransactionTemplate;

import com.camerashop.TestcontainersConfig;
import com.camerashop.dto.order.CreateOrderDTO;
import com.camerashop.dto.order.OrderDTO;
import com.camerashop.entity.Cart;
import com.camerashop.entity.Order;
import com.camerashop.entity.OrderStatus;
import com.camerashop.entity.PaymentMethod;
import com.camerashop.entity.PaymentStatus;
import com.camerashop.entity.ProductVariant;
import com.camerashop.entity.Role;
import com.camerashop.entity.User;
import com.camerashop.exception.BadRequestException;
import com.camerashop.repository.CartRepository;
import com.camerashop.repository.OrderRepository;
import com.camerashop.repository.ProductVariantRepository;
import com.camerashop.repository.UserRepository;
import com.camerashop.service.OrderService;
import com.camerashop.service.PaymentService;
import com.camerashop.service.PaymentService.VnpayResult;

@SpringBootTest(properties = {"app.vnpay.tmn-code=TESTCODE", "app.vnpay.hash-secret=TEST-SECRET-KEY"})
@AutoConfigureMockMvc
@Import(TestcontainersConfig.class)
class PaymentFlowTest {

    @Autowired private MockMvc mockMvc;

    private static final String SKU = "SONY-A6400-BODY";
    private static final int START_STOCK = 5;

    @Autowired private OrderService orderService;
    @Autowired private PaymentService paymentService;
    @Autowired private VnpayService vnpayService;
    @Autowired private UserRepository userRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private ProductVariantRepository variantRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private TransactionTemplate transaction;

    private Long userId;
    private Long variantId;

    @BeforeEach
    void setUp() {
        transaction.executeWithoutResult(status -> {
            ProductVariant variant = variantRepository.findBySku(SKU).orElseThrow();
            variant.setStock(START_STOCK);
            variantId = variant.getId();
            User user = userRepository.save(
                    new User("Khách VNPay", "vnpay-" + UUID.randomUUID() + "@test.local", "x", Role.CUSTOMER));
            Cart cart = new Cart(user);
            cart.addItem(variant, 1);
            cartRepository.save(cart);
            userId = user.getId();
        });
    }

    @Test
    void successfulPaymentMarksOrderPaid() {
        OrderDTO order = placeVnpayOrder();
        VnpayResult result = paymentService.handleVnpayResult(vnpayCallback(order, "00"));

        assertEquals("00", result.code());
        assertTrue(result.paid());
        Order saved = orderRepository.findById(order.id()).orElseThrow();
        assertEquals(PaymentStatus.PAID, saved.getPaymentStatus());
        assertEquals(OrderStatus.PENDING, saved.getStatus());
        assertNotNull(saved.getPaidAt());
        assertEquals("14000001", saved.getPaymentTxnNo());
        assertEquals(START_STOCK - 1, stock());
    }

    @Test
    void sameResultTwiceIsHandledOnce() {
        OrderDTO order = placeVnpayOrder();
        Map<String, String> callback = vnpayCallback(order, "00");

        assertEquals("00", paymentService.handleVnpayResult(callback).code());
        VnpayResult second = paymentService.handleVnpayResult(callback);

        assertEquals("02", second.code());
        assertTrue(second.paid());
        assertEquals(PaymentStatus.PAID, orderRepository.findById(order.id()).orElseThrow().getPaymentStatus());
    }

    @Test
    void failedPaymentCancelsOrderAndRestocks() {
        OrderDTO order = placeVnpayOrder();
        assertEquals(START_STOCK - 1, stock());

        VnpayResult result = paymentService.handleVnpayResult(vnpayCallback(order, "24"));

        assertFalse(result.paid());
        Order saved = orderRepository.findById(order.id()).orElseThrow();
        assertEquals(PaymentStatus.FAILED, saved.getPaymentStatus());
        assertEquals(OrderStatus.CANCELLED, saved.getStatus());
        assertEquals(START_STOCK, stock());
    }

    @Test
    void wrongAmountIsRejected() {
        OrderDTO order = placeVnpayOrder();
        Map<String, String> callback = vnpayCallback(order, "00");
        callback.put("vnp_Amount", "100000");
        callback.put("vnp_SecureHash", vnpayService.sign(withoutHash(callback)));

        assertEquals("04", paymentService.handleVnpayResult(callback).code());
        assertEquals(PaymentStatus.UNPAID, orderRepository.findById(order.id()).orElseThrow().getPaymentStatus());
    }

    @Test
    void forgedResultIsRejected() {
        OrderDTO order = placeVnpayOrder();
        Map<String, String> callback = vnpayCallback(order, "24");
        callback.put("vnp_ResponseCode", "00");
        callback.put("vnp_TransactionStatus", "00");

        assertEquals("97", paymentService.handleVnpayResult(callback).code());
        assertEquals(PaymentStatus.UNPAID, orderRepository.findById(order.id()).orElseThrow().getPaymentStatus());
    }

    @Test
    void customerCannotCancelPaidOrder() {
        OrderDTO order = placeVnpayOrder();
        paymentService.handleVnpayResult(vnpayCallback(order, "00"));

        assertThrows(BadRequestException.class, () -> orderService.cancelMyOrder(userId, order.id()));
    }

    @Test
    void returnEndpointIsPublicAndCreateUrlNeedsLogin() throws Exception {
        OrderDTO order = placeVnpayOrder();
        MockHttpServletRequestBuilder request = get("/api/payments/vnpay/return");
        vnpayCallback(order, "00").forEach((key, value) -> request.param(key, value));

        mockMvc.perform(request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(order.id()))
                .andExpect(jsonPath("$.paid").value(true));
        mockMvc.perform(post("/api/payments/vnpay/" + order.id()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void codOrderHasNoPaymentUrl() {
        OrderDTO order = orderService.placeOrder(userId,
                new CreateOrderDTO("Khách VNPay", "0901234567", "1 Lê Lợi", PaymentMethod.COD));
        assertThrows(BadRequestException.class, () -> paymentService.createVnpayUrl(userId, order.id(), "127.0.0.1"));
    }

    private OrderDTO placeVnpayOrder() {
        OrderDTO order = orderService.placeOrder(userId,
                new CreateOrderDTO("Khách VNPay", "0901234567", "1 Lê Lợi", PaymentMethod.VNPAY));
        assertTrue(paymentService.createVnpayUrl(userId, order.id(), "127.0.0.1").contains("vnp_SecureHash="));
        return order;
    }

    private Map<String, String> vnpayCallback(OrderDTO order, String responseCode) {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_TmnCode", "TESTCODE");
        params.put("vnp_TxnRef", order.id() + "_1");
        params.put("vnp_Amount", order.totalAmount().movePointRight(2).toPlainString());
        params.put("vnp_ResponseCode", responseCode);
        params.put("vnp_TransactionStatus", responseCode);
        params.put("vnp_TransactionNo", "14000001");
        params.put("vnp_BankCode", "NCB");
        params.put("vnp_SecureHash", vnpayService.sign(params));
        return params;
    }

    private static Map<String, String> withoutHash(Map<String, String> params) {
        Map<String, String> copy = new HashMap<>(params);
        copy.remove("vnp_SecureHash");
        return copy;
    }

    private int stock() {
        return variantRepository.findById(variantId).orElseThrow().getStock();
    }
}
