package com.camerashop.repository;

import org.springframework.data.jpa.domain.Specification;

import com.camerashop.entity.Product;

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
}
