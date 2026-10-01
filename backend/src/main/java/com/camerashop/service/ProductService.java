package com.camerashop.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.camerashop.dto.product.ProductDetailDTO;
import com.camerashop.dto.product.ProductSummaryDTO;
import com.camerashop.dto.product.VariantDTO;
import com.camerashop.entity.Product;
import com.camerashop.repository.ProductRepository;
import com.camerashop.repository.ProductVariantRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final String CAMERA = "Máy ảnh";
    private static final String LENS = "Ống kính";
    private static final String BATTERY_AND_CHARGER = "Pin & sạc";

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    public List<ProductSummaryDTO> getAll() {
        return productRepository.findAll().stream()
                .map(product -> ProductSummaryDTO.from(product))
                .toList();
    }

    public ProductDetailDTO getDetail(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm " + id));

        List<VariantDTO> variants = productVariantRepository.findByProductIdOrderByPriceAsc(id).stream()
                .map(variant -> VariantDTO.from(variant))
                .toList();

        List<ProductSummaryDTO> compatible = findCompatibleProducts(product).stream()
                .map(p -> ProductSummaryDTO.from(p))
                .toList();

        return ProductDetailDTO.from(product, variants, compatible);
    }

    private List<Product> findCompatibleProducts(Product product) {
        String category = product.getCategory().getName();
        if (category.equals(BATTERY_AND_CHARGER)) {
            return productRepository.findCamerasForAccessory(product.getId());
        }
        if (category.equals(LENS)){
            return productRepository.findByMountIdAndCategoryName(product.getMount().getId(), CAMERA);
        }
        if (category.equals(CAMERA)){
            List<Product> result = new ArrayList<>();
            if (product.getMount() != null){
                result.addAll(productRepository.findByMountIdAndCategoryName(product.getMount().getId(), LENS));
            }
            result.addAll(productRepository.findByCompatibleCamerasId(product.getId()));
            return result;
        }

        return new ArrayList<>();
    }
}
