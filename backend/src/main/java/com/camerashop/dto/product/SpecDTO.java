package com.camerashop.dto.product;

import com.camerashop.entity.ProductSpec;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SpecDTO(
        @Size(max = 60, message = "Tên nhóm tối đa 60 ký tự")
        String group,

        @NotBlank(message = "Vui lòng nhập tên thông số")
        @Size(max = 60, message = "Tên thông số tối đa 60 ký tự")
        String label,

        @NotBlank(message = "Vui lòng nhập giá trị thông số")
        @Size(max = 200, message = "Giá trị thông số tối đa 200 ký tự")
        String value) {

    public static SpecDTO from(ProductSpec spec) {
        return new SpecDTO(spec.getGroupName(), spec.getLabel(), spec.getValue());
    }
}
