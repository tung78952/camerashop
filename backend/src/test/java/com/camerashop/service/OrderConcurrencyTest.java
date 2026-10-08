package com.camerashop.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.support.TransactionTemplate;

import com.camerashop.TestcontainersConfig;
import com.camerashop.dto.order.CreateOrderDTO;
import com.camerashop.entity.Cart;
import com.camerashop.entity.PaymentMethod;
import com.camerashop.entity.ProductVariant;
import com.camerashop.entity.Role;
import com.camerashop.entity.User;
import com.camerashop.exception.OutOfStockException;
import com.camerashop.repository.CartRepository;
import com.camerashop.repository.OrderRepository;
import com.camerashop.repository.ProductVariantRepository;
import com.camerashop.repository.UserRepository;

@SpringBootTest
@Import(TestcontainersConfig.class)
class OrderConcurrencyTest {

    private static final int BUYERS = 10;
    private static final String SKU = "FUJI-X100VI-BLK";
    private static final CreateOrderDTO SHIPPING =
            new CreateOrderDTO("Người mua thử", "0901234567", "1 Lê Lợi, Q1, TP.HCM", PaymentMethod.COD);

    @Autowired private OrderService orderService;
    @Autowired private UserRepository userRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private ProductVariantRepository variantRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private TransactionTemplate transaction;

    private Long variantId;
    private final List<Long> buyerIds = new ArrayList<>();

    @BeforeEach
    void setUp() {
        buyerIds.clear();
        transaction.executeWithoutResult(status -> {
            ProductVariant variant = variantRepository.findBySku(SKU).orElseThrow();
            variant.setStock(1);
            variantId = variant.getId();

            String batch = UUID.randomUUID().toString();
            for (int i = 1; i <= BUYERS; i++) {
                User user = userRepository.save(
                        new User("Người mua " + i, "buyer" + i + "-" + batch + "@test.local", "x", Role.CUSTOMER));
                Cart cart = new Cart(user);
                cart.addItem(variant, 1);
                cartRepository.save(cart);
                buyerIds.add(user.getId());
            }
        });
    }

    @Test
    void onlyOneBuyerGetsTheLastItem() throws Exception {
        List<Outcome> outcomes = raceAll(buyerId -> orderService.placeOrder(buyerId, SHIPPING));

        long success = outcomes.stream().filter(o -> o == Outcome.SUCCESS).count();
        long outOfStock = outcomes.stream().filter(o -> o == Outcome.OUT_OF_STOCK).count();
        System.out.printf("[CÁCH ĐÚNG] %d người cùng mua 1 chiếc -> mua được: %d, hết hàng: %d, kho còn: %d%n",
                BUYERS, success, outOfStock, currentStock());

        assertEquals(1, success, "Chỉ 1 người được mua chiếc cuối cùng");
        assertEquals(BUYERS - 1, outOfStock, "9 người còn lại phải nhận 'không đủ hàng'");
        assertEquals(0, currentStock(), "Kho về 0, không bao giờ âm");
        assertEquals(1, countOrdersOfBuyers(), "Chỉ 1 đơn được tạo");
    }

    @Test
    void naiveReadThenWriteOversells() throws Exception {
        List<Outcome> outcomes = raceAll(buyerId -> transaction.executeWithoutResult(status -> {
            ProductVariant variant = variantRepository.findById(variantId).orElseThrow();
            int stock = variant.getStock();
            if (stock < 1) {
                throw new OutOfStockException("Hết hàng");
            }
            sleep(100);
            variant.setStock(stock - 1);
        }));

        long success = outcomes.stream().filter(o -> o == Outcome.SUCCESS).count();
        System.out.printf("[CÁCH SAI ] %d người cùng mua 1 chiếc -> mua được: %d (BÁN LỐ %d chiếc), kho còn: %d%n",
                BUYERS, success, success - 1, currentStock());

        assertTrue(success > 1, "Cách sai để nhiều người cùng 'mua được' chiếc cuối cùng (bán lố): " + success);
    }

    private enum Outcome { SUCCESS, OUT_OF_STOCK }

    @FunctionalInterface
    private interface BuyAction {
        void buy(Long buyerId) throws Exception;
    }

    private List<Outcome> raceAll(BuyAction action) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(BUYERS);
        CountDownLatch startGun = new CountDownLatch(1);
        try {
            List<Future<Outcome>> futures = new ArrayList<>();
            for (Long buyerId : buyerIds) {
                futures.add(pool.submit(() -> {
                    startGun.await();
                    try {
                        action.buy(buyerId);
                        return Outcome.SUCCESS;
                    } catch (OutOfStockException e) {
                        return Outcome.OUT_OF_STOCK;
                    }
                }));
            }
            startGun.countDown();

            List<Outcome> outcomes = new ArrayList<>();
            for (Future<Outcome> future : futures) {
                outcomes.add(future.get(30, TimeUnit.SECONDS));
            }
            return outcomes;
        } finally {
            pool.shutdownNow();
        }
    }

    private int currentStock() {
        return variantRepository.findById(variantId).orElseThrow().getStock();
    }

    private long countOrdersOfBuyers() {
        return buyerIds.stream()
                .mapToLong(id -> orderRepository.findByUserIdOrderByCreatedAtDesc(id).size())
                .sum();
    }

    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
