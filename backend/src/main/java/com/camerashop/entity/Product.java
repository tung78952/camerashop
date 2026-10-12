// Product with its brand, category, optional mount, image gallery, technical specs and soft-delete flag.

package com.camerashop.entity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
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

    // Image gallery in display order (product_images table); the first image is the main one.
    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @OrderColumn(name = "sort_order")
    @Column(name = "url")
    private List<String> images = new ArrayList<>();

    // Technical specs in display order (product_specs table).
    @ElementCollection
    @CollectionTable(name = "product_specs", joinColumns = @JoinColumn(name = "product_id"))
    @OrderColumn(name = "sort_order")
    private List<ProductSpec> specs = new ArrayList<>();

    // Hidden products stay in the database because past orders still reference them.
    private boolean active = true;

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

    // Cameras this battery/charger is compatible with (product_compatibility table).
    @ManyToMany
    @JoinTable(
        name = "product_compatibility",
        joinColumns = @JoinColumn (name = "accessory_id"),
        inverseJoinColumns = @JoinColumn(name = "camera_id")
    )

    private Set<Product> compatibleCameras = new HashSet<>();

    public Product(String name, Brand brand, Category category, Mount mount){
        this.name = name;
        this.brand = brand;
        this.category = category;
        this.mount = mount;
    }

}
