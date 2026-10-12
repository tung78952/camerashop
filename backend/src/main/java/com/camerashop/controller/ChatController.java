// AI shopping assistant endpoint (public, rate-limited per client IP).

package com.camerashop.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.camerashop.dto.chat.ChatRequestDTO;
import com.camerashop.dto.chat.ChatResponseDTO;
import com.camerashop.service.ChatService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ChatResponseDTO ask(@Valid @RequestBody ChatRequestDTO request, HttpServletRequest http) {
        return chatService.ask(clientKey(http), request);
    }

    // Client IP for rate limiting (first X-Forwarded-For value set by the frontend server).
    private static String clientKey(HttpServletRequest http) {
        String forwarded = http.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return http.getRemoteAddr();
    }
}
