package com.camerashop.dto.auth;

import java.time.Instant;

public record AuthResponseDTO(
        String token,
        Instant expiresAt,
        UserDTO user) {
}
