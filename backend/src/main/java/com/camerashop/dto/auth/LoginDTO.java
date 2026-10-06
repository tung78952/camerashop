package com.camerashop.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginDTO(
        @NotBlank(message = "Vui lòng nhập email")
        String email,

        @NotBlank(message = "Vui lòng nhập mật khẩu")
        String password) {
}
