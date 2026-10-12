// A review as shown on the product page (reviewer name only, no user details).

package com.camerashop.dto.review;

import java.time.Instant;

import com.camerashop.entity.Review;

public record ReviewDTO(
        Long id,
        String reviewerName,
        int rating,
        String comment,
        Instant createdAt,
        boolean edited) {

    public static ReviewDTO from(Review review) {
        boolean edited = review.getUpdatedAt() != null
                && review.getUpdatedAt().isAfter(review.getCreatedAt().plusSeconds(1));
        return new ReviewDTO(
                review.getId(),
                review.getUser().getName(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt(),
                edited);
    }
}
