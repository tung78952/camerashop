package com.camerashop.dto.chat;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatRequestDTO(
        @NotBlank(message = "Bạn chưa nhập câu hỏi")
        @Size(max = 500, message = "Câu hỏi tối đa 500 ký tự")
        String message,

        @Size(max = 10, message = "Lịch sử chat quá dài")
        List<@Valid ChatMessageDTO> history) {
}
