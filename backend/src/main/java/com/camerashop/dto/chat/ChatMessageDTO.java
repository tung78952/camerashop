// One previous chat message sent as context for follow-up questions.

package com.camerashop.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ChatMessageDTO(
        @Pattern(regexp = "user|assistant", message = "Vai trò tin nhắn không hợp lệ")
        @NotBlank(message = "Thiếu vai trò tin nhắn")
        String role,

        @NotBlank(message = "Tin nhắn trống")
        @Size(max = 2000, message = "Tin nhắn quá dài")
        String text) {
}
