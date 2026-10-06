package com.camerashop.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.camerashop.dto.auth.AuthResponseDTO;
import com.camerashop.dto.auth.LoginDTO;
import com.camerashop.dto.auth.RegisterDTO;
import com.camerashop.dto.auth.UserDTO;
import com.camerashop.security.CurrentUser;
import com.camerashop.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponseDTO register(@Valid @RequestBody RegisterDTO request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@Valid @RequestBody LoginDTO request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserDTO me(@AuthenticationPrincipal Jwt jwt) {
        return authService.me(CurrentUser.id(jwt));
    }
}
