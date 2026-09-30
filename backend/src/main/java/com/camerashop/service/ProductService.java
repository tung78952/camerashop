package com.camerashop.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.camerashop.dto.ProductSummaryResponse;
import com.camerashop.entity.Product;
import com.camerashop.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductSummaryResponse> getAll() {
        List<Product> products = productRepository.findAll();

        List<ProductSummaryResponse> result = new ArrayList<>();
        for (Product product : products) {
            result.add(ProductSummaryResponse.from(product));
        }
        return result;
    }
}
