package com.camerashop.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.camerashop.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = {"brand", "category", "mount"})
    Page<Product> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"brand", "category", "mount"})
    Optional<Product> findById(Long id);

    @EntityGraph(attributePaths = {"brand", "category", "mount"})
    List<Product> findByMountIdAndCategoryName(Long mountId, String categoryName);

    @EntityGraph(attributePaths = {"brand", "category", "mount"})
    List<Product> findByCompatibleCamerasId(Long cameraId);

    @Query("""
            SELECT c FROM Product a
            JOIN a.compatibleCameras c
            JOIN FETCH c.brand
            JOIN FETCH c.category
            LEFT JOIN FETCH c.mount
            WHERE a.id = :accessoryId
            """)
    List<Product> findCamerasForAccessory(Long accessoryId);
}
