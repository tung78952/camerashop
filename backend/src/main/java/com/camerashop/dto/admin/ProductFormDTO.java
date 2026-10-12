// Admin create/edit product form: details, images, variants, compatible cameras and specs, with validation rules.

package com.camerashop.dto.admin;

import java.util.List;

import com.camerashop.dto.product.SpecDTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProductFormDTO(
        @NotBlank(message = "Vui lòng nhập tên sản phẩm")
        @Size(max = 100, message = "Tên sản phẩm tối đa 100 ký tự")
        String name,

        @Size(max = 2000, message = "Mô tả tối đa 2000 ký tự")
        String description,

        @NotNull(message = "Vui lòng chọn hãng")
        Long brandId,

        @NotNull(message = "Vui lòng chọn danh mục")
        Long categoryId,

        Long mountId,

        // Image paths in display order; only shop-hosted paths are accepted.
        @Size(max = 12, message = "Tối đa 12 ảnh")
        List<@Pattern(regexp = "^(/uploads/products/|/products/|https://)[A-Za-z0-9._/-]+$",
                message = "Đường dẫn ảnh không hợp lệ") String> images,

        @NotEmpty(message = "Cần ít nhất 1 phiên bản")
        @Size(max = 20, message = "Tối đa 20 phiên bản")
        List<@Valid VariantFormDTO> variants,

        List<Long> compatibleCameraIds,

        @Size(max = 80, message = "Tối đa 80 dòng thông số")
        List<@Valid SpecDTO> specs) {
}
