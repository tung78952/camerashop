package com.camerashop.controller;

import java.math.BigDecimal;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.camerashop.dto.common.PageDTO;
import com.camerashop.dto.product.ProductDetailDTO;
import com.camerashop.dto.product.ProductSummaryDTO;
import com.camerashop.service.ProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public PageDTO<ProductSummaryDTO> getAll(
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long mountId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @PageableDefault(size = 12, sort = "id") Pageable pageable) {
        return productService.getAll(brandId, categoryId, mountId, minPrice, maxPrice, pageable);
    }

    @GetMapping("/{id}")
    public ProductDetailDTO getDetail(@PathVariable Long id) {
        return productService.getDetail(id);
    }
}
