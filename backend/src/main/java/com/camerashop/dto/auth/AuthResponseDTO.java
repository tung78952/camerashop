// Returned after login/register: the JWT, its expiry time and the user.

package com.camerashop.dto.auth;

import java.time.Instant;

public record AuthResponseDTO(
        String token,
        Instant expiresAt,
        UserDTO user) {
}
