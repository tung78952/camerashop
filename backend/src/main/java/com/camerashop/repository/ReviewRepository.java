package com.camerashop.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.camerashop.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @EntityGraph(attributePaths = "user")
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    Optional<Review> findByProductIdAndUserId(Long productId, Long userId);

    interface RatingRow {
        Long getProductId();
        Double getAverage();
        Long getCount();
    }

    @Query("""
            SELECT r.product.id AS productId, AVG(r.rating) AS average, COUNT(r) AS count
            FROM Review r
            WHERE r.product.id IN :productIds
            GROUP BY r.product.id
            """)
    List<RatingRow> findRatings(List<Long> productIds);

    interface StarCountRow {
        Integer getRating();
        Long getCount();
    }

    @Query("SELECT r.rating AS rating, COUNT(r) AS count FROM Review r WHERE r.product.id = :productId GROUP BY r.rating")
    List<StarCountRow> countByStar(Long productId);
}
