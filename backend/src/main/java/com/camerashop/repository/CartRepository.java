package com.camerashop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.camerashop.entity.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {
}
