package com.camerashop.service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.camerashop.dto.admin.AdminProductDetailDTO;
import com.camerashop.dto.admin.AdminProductRowDTO;
import com.camerashop.dto.admin.ProductFormDTO;
import com.camerashop.dto.admin.VariantFormDTO;
import com.camerashop.dto.product.VariantDTO;
import com.camerashop.entity.Brand;
import com.camerashop.entity.Category;
import com.camerashop.entity.Mount;
import com.camerashop.entity.Product;
import com.camerashop.entity.ProductSpec;
import com.camerashop.entity.ProductVariant;
import com.camerashop.exception.BadRequestException;
import com.camerashop.exception.NotFoundException;
import com.camerashop.repository.BrandRepository;
import com.camerashop.repository.CartItemRepository;
import com.camerashop.repository.CategoryRepository;
import com.camerashop.repository.MountRepository;
import com.camerashop.repository.OrderItemRepository;
import com.camerashop.repository.ProductRepository;
import com.camerashop.repository.ProductVariantRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminProductService {

    private static final String CAMERA = "Máy ảnh";
    private static final String BATTERY_AND_CHARGER = "Pin & sạc";

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final MountRepository mountRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;

    @Transactional(readOnly = true)
    public List<AdminProductRowDTO> list() {
        Map<Long, List<ProductVariant>> variantsByProduct = productVariantRepository.findAll().stream()
                .collect(Collectors.groupingBy(variant -> variant.getProduct().getId()));
        return productRepository.findAllByOrderByIdDesc().stream()
                .map(product -> AdminProductRowDTO.from(product, variantsByProduct.getOrDefault(product.getId(), List.of())))
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminProductDetailDTO get(Long id) {
        return toDetail(findProduct(id));
    }

    @Transactional
    public AdminProductDetailDTO create(ProductFormDTO form) {
        checkSkus(form, null);
        Product product = new Product(form.name().trim(), findBrand(form.brandId()), findCategory(form.categoryId()),
                findMount(form.mountId()));
        applyDetails(product, form);
        productRepository.save(product);
        for (VariantFormDTO v : form.variants()) {
            productVariantRepository.save(new ProductVariant(v.name().trim(), v.sku(), v.price(), v.stock(), product));
        }
        return toDetail(product);
    }

    @Transactional
    public AdminProductDetailDTO update(Long id, ProductFormDTO form) {
        Product product = findProduct(id);
        checkSkus(form, id);

        product.setName(form.name().trim());
        product.setBrand(findBrand(form.brandId()));
        product.setCategory(findCategory(form.categoryId()));
        product.setMount(findMount(form.mountId()));
        applyDetails(product, form);

        Map<Long, ProductVariant> existing = productVariantRepository.findByProductIdOrderByPriceAsc(id).stream()
                .collect(Collectors.toMap(variant -> variant.getId(), Function.identity()));
        Set<Long> keptIds = form.variants().stream().map(v -> v.id()).filter(Objects::nonNull).collect(Collectors.toSet());
        if (!existing.keySet().containsAll(keptIds)) {
            throw new BadRequestException("Có phiên bản không thuộc sản phẩm này");
        }

        for (ProductVariant variant : existing.values()) {
            if (!keptIds.contains(variant.getId())) {
                if (orderItemRepository.existsByProductVariantId(variant.getId())) {
                    throw new BadRequestException("Phiên bản \"" + variant.getName()
                            + "\" đã có trong đơn hàng, không xóa được — hãy đặt tồn kho = 0");
                }
                cartItemRepository.deleteByProductVariantId(variant.getId());
                productVariantRepository.delete(variant);
            }
        }
        productVariantRepository.flush();

        for (VariantFormDTO v : form.variants()) {
            if (v.id() == null) {
                productVariantRepository.save(new ProductVariant(v.name().trim(), v.sku(), v.price(), v.stock(), product));
            } else {
                ProductVariant variant = existing.get(v.id());
                variant.setName(v.name().trim());
                variant.setSku(v.sku());
                variant.setPrice(v.price());
                variant.setStock(v.stock());
            }
        }
        return toDetail(product);
    }

    @Transactional
    public AdminProductDetailDTO setActive(Long id, boolean active) {
        Product product = findProduct(id);
        product.setActive(active);
        return toDetail(product);
    }

    private void applyDetails(Product product, ProductFormDTO form) {
        String description = form.description() == null ? "" : form.description().trim();
        product.setDescription(description.isEmpty() ? null : description);

        List<String> images = form.images() == null ? List.of() : form.images();
        if (new HashSet<>(images).size() != images.size()) {
            throw new BadRequestException("Có ảnh bị chọn 2 lần");
        }
        product.getImages().clear();
        product.getImages().addAll(images);
        product.setImageUrl(images.isEmpty() ? null : images.get(0));

        product.getSpecs().clear();
        if (form.specs() != null) {
            form.specs().forEach(spec -> product.getSpecs().add(
                    new ProductSpec(blankToNull(spec.group()), spec.label().trim(), spec.value().trim())));
        }

        product.getCompatibleCameras().clear();
        List<Long> cameraIds = form.compatibleCameraIds() == null ? List.of() : form.compatibleCameraIds();
        if (BATTERY_AND_CHARGER.equals(product.getCategory().getName()) && !cameraIds.isEmpty()) {
            List<Product> cameras = productRepository.findAllById(cameraIds);
            if (cameras.size() != new HashSet<>(cameraIds).size()
                    || cameras.stream().anyMatch(camera -> !CAMERA.equals(camera.getCategory().getName()))) {
                throw new BadRequestException("Danh sách máy tương thích không hợp lệ");
            }
            product.getCompatibleCameras().addAll(cameras);
        }
    }

    private String blankToNull(String text) {
        return text == null || text.isBlank() ? null : text.trim();
    }

    private void checkSkus(ProductFormDTO form, Long productId) {
        Set<String> seen = new HashSet<>();
        for (VariantFormDTO v : form.variants()) {
            if (!seen.add(v.sku())) {
                throw new BadRequestException("SKU " + v.sku() + " bị nhập 2 lần");
            }
            productVariantRepository.findBySku(v.sku())
                    .filter(owner -> productId == null || !owner.getProduct().getId().equals(productId))
                    .ifPresent(owner -> {
                        throw new BadRequestException("SKU " + v.sku() + " đã được dùng cho sản phẩm khác");
                    });
        }
    }

    private AdminProductDetailDTO toDetail(Product product) {
        List<VariantDTO> variants = product.getId() == null ? List.of()
                : productVariantRepository.findByProductIdOrderByPriceAsc(product.getId()).stream()
                        .map(variant -> VariantDTO.from(variant))
                        .toList();
        return AdminProductDetailDTO.from(product, variants);
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm " + id));
    }

    private Brand findBrand(Long id) {
        return brandRepository.findById(id).orElseThrow(() -> new BadRequestException("Hãng không tồn tại"));
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> new BadRequestException("Danh mục không tồn tại"));
    }

    private Mount findMount(Long id) {
        return id == null ? null : mountRepository.findById(id).orElseThrow(() -> new BadRequestException("Ngàm không tồn tại"));
    }
}
