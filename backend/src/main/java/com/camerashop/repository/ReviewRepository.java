// Review queries and rating aggregates.

package com.camerashop.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.camerashop.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Reviews of a product, newest first, with the reviewer loaded in the same query.
    @EntityGraph(attributePaths = "user")
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    Optional<Review> findByProductIdAndUserId(Long productId, Long userId);

    // Projection: product id, average rating and review count.
    interface RatingRow {
        Long getProductId();
        Double getAverage();
        Long getCount();
    }

    // Ratings for a whole page of products in one query.
    @Query("""
            SELECT r.product.id AS productId, AVG(r.rating) AS average, COUNT(r) AS count
            FROM Review r
            WHERE r.product.id IN :productIds
            GROUP BY r.product.id
            """)
    List<RatingRow> findRatings(List<Long> productIds);

    // Projection: number of reviews per star value.
    interface StarCountRow {
        Integer getRating();
        Long getCount();
    }

    @Query("SELECT r.rating AS rating, COUNT(r) AS count FROM Review r WHERE r.product.id = :productId GROUP BY r.rating")
    List<StarCountRow> countByStar(Long productId);
}
