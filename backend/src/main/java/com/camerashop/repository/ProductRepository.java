// Product queries used by the catalog, product page, compatibility suggestions, admin and chat assistant.

package com.camerashop.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.camerashop.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    // One filtered page of products (filters built with ProductSpecification).
    @EntityGraph(attributePaths = {"brand", "category", "mount"})
    Page<Product> findAll(Specification<Product> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"brand", "category", "mount"})
    Optional<Product> findById(Long id);

    // Products of a category with the given mount (e.g. lenses for a camera).
    @EntityGraph(attributePaths = {"brand", "category", "mount"})
    List<Product> findByMountIdAndCategoryName(Long mountId, String categoryName);

    // Batteries and chargers compatible with a camera.
    @EntityGraph(attributePaths = {"brand", "category", "mount"})
    List<Product> findByCompatibleCamerasId(Long cameraId);

    // Reverse lookup: cameras compatible with a battery or charger.
    @Query("""
            SELECT c FROM Product a
            JOIN a.compatibleCameras c
            JOIN FETCH c.brand
            JOIN FETCH c.category
            LEFT JOIN FETCH c.mount
            WHERE a.id = :accessoryId
            """)
    List<Product> findCamerasForAccessory(Long accessoryId);

    // All products including hidden ones, newest first (admin).
    @EntityGraph(attributePaths = {"brand", "category", "mount"})
    List<Product> findAllByOrderByIdDesc();

    // Products on sale with their specs loaded in one query (chat assistant).
    @EntityGraph(attributePaths = {"brand", "category", "mount", "specs"})
    List<Product> findByActiveTrue();
}
