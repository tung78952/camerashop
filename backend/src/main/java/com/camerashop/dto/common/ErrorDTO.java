package com.camerashop.dto.common;

public record ErrorDTO(
        int status,
        String message) {
}
