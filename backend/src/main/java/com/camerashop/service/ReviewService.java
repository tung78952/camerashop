// Reviews: public reading, "has purchased" check and create-or-update of the user's own review.

package com.camerashop.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.camerashop.dto.review.MyReviewDTO;
import com.camerashop.dto.review.ProductReviewsDTO;
import com.camerashop.dto.review.ReviewDTO;
import com.camerashop.dto.review.ReviewFormDTO;
import com.camerashop.entity.OrderStatus;
import com.camerashop.entity.Product;
import com.camerashop.entity.Review;
import com.camerashop.exception.ForbiddenException;
import com.camerashop.exception.NotFoundException;
import com.camerashop.repository.OrderItemRepository;
import com.camerashop.repository.ProductRepository;
import com.camerashop.repository.ReviewRepository;
import com.camerashop.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;

    // Average, per-star counts and the review list.
    @Transactional(readOnly = true)
    public ProductReviewsDTO getProductReviews(Long productId) {
        findVisibleProduct(productId);

        List<ReviewDTO> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(review -> ReviewDTO.from(review))
                .toList();

        Map<Integer, Long> byStar = reviewRepository.countByStar(productId).stream()
                .collect(Collectors.toMap(row -> row.getRating(), row -> row.getCount()));
        List<Long> starCounts = new ArrayList<>();
        long count = 0;
        long totalStars = 0;
        for (int star = 5; star >= 1; star--) {
            long n = byStar.getOrDefault(star, 0L);
            starCounts.add(n);
            count += n;
            totalStars += n * star;
        }
        double average = count == 0 ? 0 : roundOneDecimal((double) totalStars / count);
        return new ProductReviewsDTO(average, count, starCounts, reviews);
    }

    // Whether the user may review and their existing review.
    @Transactional(readOnly = true)
    public MyReviewDTO getMyReview(Long userId, Long productId) {
        findVisibleProduct(productId);
        ReviewDTO mine = reviewRepository.findByProductIdAndUserId(productId, userId)
                .map(review -> ReviewDTO.from(review))
                .orElse(null);
        return new MyReviewDTO(hasPurchased(userId, productId), mine);
    }

    // Upsert: only users with a COMPLETED order for the product may review (403 otherwise).
    @Transactional
    public ReviewDTO saveMyReview(Long userId, Long productId, ReviewFormDTO form) {
        Product product = findVisibleProduct(productId);
        if (!hasPurchased(userId, productId)) {
            throw new ForbiddenException("Bạn cần mua và nhận hàng sản phẩm này (đơn ở trạng thái Hoàn thành) mới đánh giá được");
        }

        String comment = form.comment() == null || form.comment().isBlank() ? null : form.comment().trim();
        Review review = reviewRepository.findByProductIdAndUserId(productId, userId)
                .orElse(null);
        if (review == null) {
            review = new Review(product, userRepository.getReferenceById(userId), form.rating(), comment);
        } else {
            review.setRating(form.rating());
            review.setComment(comment);
        }
        return ReviewDTO.from(reviewRepository.saveAndFlush(review));
    }

    private boolean hasPurchased(Long userId, Long productId) {
        return orderItemRepository.existsByOrderUserIdAndOrderStatusAndProductVariantProductId(
                userId, OrderStatus.COMPLETED, productId);
    }

    private Product findVisibleProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm " + productId));
        if (!product.isActive()) {
            throw new NotFoundException("Không tìm thấy sản phẩm " + productId);
        }
        return product;
    }

    static double roundOneDecimal(double value) {
        return Math.round(value * 10) / 10.0;
    }
}
