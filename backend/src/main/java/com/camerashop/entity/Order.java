// Customer order: shipping info, delivery status, payment status and the ordered items.

package com.camerashop.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal totalAmount;
    private String receiverName;
    private String phone;
    private String address;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    // Payment info: COD by default; VNPay orders switch the method and track the transaction.
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod = PaymentMethod.COD;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    private Instant paidAt;
    private String paymentTxnNo;

    @CreationTimestamp
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    // New orders always start as PENDING; the service sets the total after adding items.
    public Order(User user, String receiverName, String phone, String address) {
        this.user = user;
        this.receiverName = receiverName;
        this.phone = phone;
        this.address = address;
        this.status = OrderStatus.PENDING;
        this.totalAmount = BigDecimal.ZERO;
    }

    // Adds an item and keeps both sides of the relationship in sync.
    public void addItem(ProductVariant productVariant, Integer quantity, BigDecimal unitPrice) {
        items.add(new OrderItem(this, productVariant, quantity, unitPrice));
    }
}
