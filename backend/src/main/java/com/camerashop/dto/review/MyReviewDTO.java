// Current user's review status: whether they may review and their existing review.

package com.camerashop.dto.review;

public record MyReviewDTO(
        boolean canReview,
        ReviewDTO myReview) {
}
