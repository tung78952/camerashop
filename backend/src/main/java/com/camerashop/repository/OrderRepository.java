package com.camerashop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.camerashop.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
