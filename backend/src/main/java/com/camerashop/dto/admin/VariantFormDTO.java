// One variant row in the admin product form (id is null for a new variant).

package com.camerashop.dto.admin;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record VariantFormDTO(
        Long id,

        @NotBlank(message = "Vui lòng nhập tên phiên bản")
        @Size(max = 100, message = "Tên phiên bản tối đa 100 ký tự")
        String name,

        @NotBlank(message = "Vui lòng nhập SKU")
        @Size(max = 50, message = "SKU tối đa 50 ký tự")
        @Pattern(regexp = "^[A-Z0-9-]+$", message = "SKU chỉ gồm chữ IN HOA, số và dấu -")
        String sku,

        @NotNull(message = "Vui lòng nhập giá")
        @DecimalMin(value = "0", message = "Giá không được âm")
        BigDecimal price,

        @NotNull(message = "Vui lòng nhập tồn kho")
        @Min(value = 0, message = "Tồn kho không được âm")
        @Max(value = 100000, message = "Tồn kho tối đa 100.000")
        Integer stock) {
}
