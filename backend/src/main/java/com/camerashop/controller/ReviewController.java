package com.camerashop.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.camerashop.dto.review.MyReviewDTO;
import com.camerashop.dto.review.ProductReviewsDTO;
import com.camerashop.dto.review.ReviewDTO;
import com.camerashop.dto.review.ReviewFormDTO;
import com.camerashop.exception.UnauthorizedException;
import com.camerashop.security.CurrentUser;
import com.camerashop.service.ReviewService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ProductReviewsDTO getReviews(@PathVariable Long productId) {
        return reviewService.getProductReviews(productId);
    }

    @GetMapping("/mine")
    public MyReviewDTO getMyReview(@AuthenticationPrincipal Jwt jwt, @PathVariable Long productId) {
        return reviewService.getMyReview(requireUserId(jwt), productId);
    }

    @PutMapping("/mine")
    public ReviewDTO saveMyReview(@AuthenticationPrincipal Jwt jwt, @PathVariable Long productId,
                                  @Valid @RequestBody ReviewFormDTO form) {
        return reviewService.saveMyReview(requireUserId(jwt), productId, form);
    }

    private static Long requireUserId(Jwt jwt) {
        if (jwt == null) {
            throw new UnauthorizedException("Vui lòng đăng nhập");
        }
        return CurrentUser.id(jwt);
    }
}
