// Lens mount data access.

package com.camerashop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.camerashop.entity.Mount;

public interface MountRepository extends JpaRepository<Mount, Long>{

}
