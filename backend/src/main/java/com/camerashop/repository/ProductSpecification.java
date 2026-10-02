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

    public static Specification<Product> hasBrand(Long brandId) {
        return (root, query, cb) -> {
            if (brandId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("brand").get("id"), brandId);
        };
    }

    public static Specification<Product> hasCategory(Long categoryId){
        return (root, query, cb) -> {
            if (categoryId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("category").get("id"), categoryId);
        };
    }

    public static Specification<Product> hasMount(Long mountId){
        return (root, query, cb) -> {
            if (mountId == null){
                return cb.conjunction();
            }
            return cb.equal(root.get("mount").get("id"), mountId);
        };
    }

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
}
