// Composable query filters for the product listing, combined with .and().

package com.camerashop.repository;

import java.math.BigDecimal;

import org.springframework.data.jpa.domain.Specification;

import com.camerashop.entity.Product;
import com.camerashop.entity.ProductVariant;

import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

public class ProductSpecification {

    // Only products that are on sale.
    public static Specification<Product> isActive() {
        return (root, query, cb) -> cb.isTrue(root.get("active"));
    }

    // Filter by brand; null means no filter.
    public static Specification<Product> hasBrand(Long brandId) {
        return (root, query, cb) -> {
            if (brandId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("brand").get("id"), brandId);
        };
    }

    // Filter by category; null means no filter.
    public static Specification<Product> hasCategory(Long categoryId){
        return (root, query, cb) -> {
            if (categoryId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("category").get("id"), categoryId);
        };
    }

    // Filter by lens mount; null means no filter.
    public static Specification<Product> hasMount(Long mountId){
        return (root, query, cb) -> {
            if (mountId == null){
                return cb.conjunction();
            }
            return cb.equal(root.get("mount").get("id"), mountId);
        };
    }

    // Case-insensitive search by product name.
    public static Specification<Product> nameContains(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return cb.conjunction();
            }
            String pattern = "%" + keyword.trim().toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), pattern);
        };
    }

    // Keep products with at least one variant in the price range.
    public static Specification<Product> priceBetween(BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if (minPrice == null && maxPrice == null) {
                return cb.conjunction();
            }

            Subquery<ProductVariant> sub = query.subquery(ProductVariant.class);
            Root<ProductVariant> variant = sub.from(ProductVariant.class);
            Path<BigDecimal> price = variant.get("price");

            Predicate condition = cb.equal(variant.get("product"), root);

            if (minPrice != null) {
                condition = cb.and(condition, cb.greaterThanOrEqualTo(price, minPrice));
            }

            if (maxPrice != null) {
                condition = cb.and(condition, cb.lessThanOrEqualTo(price, maxPrice));
            }

            sub.select(variant).where(condition);
            return cb.exists(sub);
        };
    }

    // Sort by each product's lowest variant price.
    public static Specification<Product> orderByMinPrice(boolean ascending) {
        return (root, query, cb) -> {
            if (query.getResultType() != Long.class) {
                Subquery<BigDecimal> minPrice = query.subquery(BigDecimal.class);
                Root<ProductVariant> variant = minPrice.from(ProductVariant.class);
                Path<BigDecimal> price = variant.get("price");
                minPrice.select(cb.min(price)).where(cb.equal(variant.get("product"), root));

                query.orderBy(ascending ? cb.asc(minPrice) : cb.desc(minPrice), cb.asc(root.get("id")));
            }
            return cb.conjunction();
        };
    }
}
