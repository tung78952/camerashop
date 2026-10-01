package com.camerashop.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
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
    public PageDTO<ProductSummaryDTO> getAll(Pageable pageable) {
        return productService.getAll(pageable);
    }

    @GetMapping("/{id}")
    public ProductDetailDTO getDetail(@PathVariable Long id) {
        return productService.getDetail(id);
    }
}
