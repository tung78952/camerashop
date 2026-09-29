package com.camerashop.entity;

import java.math.BigDecimal;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity 
@Table (name = "product_variants")
@Getter 
@Setter 
@NoArgsConstructor (access = AccessLevel.PROTECTED)
public class ProductVariant {
    
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    private String sku;
    private BigDecimal price;
    private Integer stock;

    @ManyToOne (fetch = FetchType.LAZY, optional = false)
    @JoinColumn (name = "product_id")
    private Product product;

    public ProductVariant (String name, String sku, BigDecimal price, Integer stock, Product product){
        this.name = name;
        this.sku = sku;
        this.price = price;
        this.stock = stock;
        this.product = product;
    }
}   
