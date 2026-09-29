package com.camerashop.entity;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity 
@Table (name = "products")
@Getter 
@Setter 
@NoArgsConstructor (access = AccessLevel.PROTECTED)
public class Product {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    private String description;
    private String imageUrl;

    @CreationTimestamp
    private Instant createdAt;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mount_id")
    private Mount mount;

    @ManyToMany
    @JoinTable(
        name = "product_compatibility",
        joinColumns = @JoinColumn (name = "accessory_id"),
        inverseJoinColumns = @JoinColumn(name = "camera_id")
    )

    private Set<Product> compatibleCameras = new HashSet<>();

    public Product(String name, Brand brand, Category category, Mount mount ){
        this.name = name;
        this.brand = brand;
        this.category = category;
        this.mount = mount;
    }

    
    
}
