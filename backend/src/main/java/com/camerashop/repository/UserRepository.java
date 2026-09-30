package com.camerashop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.camerashop.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
}
