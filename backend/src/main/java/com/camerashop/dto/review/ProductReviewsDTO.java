package com.camerashop.dto.review;

import java.util.List;

public record ProductReviewsDTO(
        double average,
        long count,
        List<Long> starCounts,
        List<ReviewDTO> reviews) {
}
