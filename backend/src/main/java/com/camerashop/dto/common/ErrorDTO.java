// Common error body returned by every API error.

package com.camerashop.dto.common;

public record ErrorDTO(
        int status,
        String message) {
}
