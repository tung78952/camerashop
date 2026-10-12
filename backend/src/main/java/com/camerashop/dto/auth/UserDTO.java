// Public user info (never includes the password hash).

package com.camerashop.dto.auth;

import com.camerashop.entity.Role;
import com.camerashop.entity.User;

public record UserDTO(
        Long id,
        String name,
        String email,
        Role role) {

    public static UserDTO from(User user) {
        return new UserDTO(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
