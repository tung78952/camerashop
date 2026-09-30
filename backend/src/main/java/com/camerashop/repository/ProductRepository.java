package com.camerashop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.camerashop.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

}
