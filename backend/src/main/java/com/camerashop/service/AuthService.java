package com.camerashop.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.camerashop.dto.auth.AuthResponseDTO;
import com.camerashop.dto.auth.LoginDTO;
import com.camerashop.dto.auth.RegisterDTO;
import com.camerashop.dto.auth.UserDTO;
import com.camerashop.entity.Role;
import com.camerashop.entity.User;
import com.camerashop.exception.BadRequestException;
import com.camerashop.exception.NotFoundException;
import com.camerashop.exception.UnauthorizedException;
import com.camerashop.repository.UserRepository;
import com.camerashop.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponseDTO register(RegisterDTO request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email này đã được đăng ký");
        }
        String passwordHash = passwordEncoder.encode(request.password());
        User user = userRepository.save(new User(request.name().trim(), email, passwordHash, Role.CUSTOMER));
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponseDTO login(LoginDTO request) {
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(() -> new UnauthorizedException("Email hoặc mật khẩu không đúng"));
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserDTO me(Long userId) {
        return userRepository.findById(userId)
                .map(user -> UserDTO.from(user))
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private AuthResponseDTO toResponse(User user) {
        JwtService.IssuedToken issued = jwtService.issue(user);
        return new AuthResponseDTO(issued.token(), issued.expiresAt(), UserDTO.from(user));
    }
}
