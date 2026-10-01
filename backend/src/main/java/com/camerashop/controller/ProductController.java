package com.camerashop.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public List<ProductSummaryDTO> getAll() {
        return productService.getAll();
    }

    @GetMapping("/{id}")
    public ProductDetailDTO getDetail(@PathVariable Long id) {
        return productService.getDetail(id);
    }
}
